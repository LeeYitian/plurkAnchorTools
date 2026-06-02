import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";
import sanitizeHtml from "sanitize-html";

/**
 * 產生 6 碼 base64url 隨機鍵（去除 `-` `_` 避免 URL 歧義）。
 * 6 碼約有 10 億種組合，在 1 小時 TTL 的前提下碰撞機率極低。
 * 若碰撞，呼叫端會最多重試 5 次（見下方 for 迴圈）。
 */
function generateKey() {
  return randomBytes(8).toString("base64url").replace(/[-_]/g, "").slice(0, 6);
}

//TODO: 可能需要壓縮文字。前端傳進來的時候就壓縮？可考慮 lz-string.js

/**
 * 大小限制的設計原因：
 * - MAX_BODY_SIZE (500 KB)：防止單次請求把 Upstash Redis 免費方案的傳輸量打滿。
 * - MAX_FIELDS (1500)：一則安價噗文通常頂多數百則回應，1500 是保守上限。
 * - MAX_PER_FIELD (100 KB)：單則留言不可能有 10 萬字，超過視為異常輸入。
 */
const MAX_BODY_SIZE = 500 * 1024;
const MAX_FIELDS = 1500;
const MAX_PER_FIELD = 100 * 1024;
export async function POST(request: NextRequest) {
  try {
    //限制資料總量
    const raw = await request.text();
    const size = Buffer.byteLength(raw, "utf8");

    if (size > MAX_BODY_SIZE) {
      return Response.json(
        {
          state: "FAILURE",
          data: "資料總量過大，請減少一次轉移的字數及留言數",
        },
        { status: 413 },
      );
    }

    const {
      data,
      plurk_id,
      selectedPlurksIds,
    }: {
      data: Record<string, string>;
      plurk_id: number;
      selectedPlurksIds: number[];
    } = JSON.parse(raw);

    // 驗證 plurk_id 對應的噗文確實存在，防止把任意資料存到 Redis
    // （若不驗證，任何人都可以用這個 API 當免費的 KV storage）
    const id = plurk_id.toString(36);
    const headPlurkResponse = await fetch(`https://www.plurk.com/p/${id}`);
    if (headPlurkResponse.status !== 200) {
      return Response.json(
        { state: "FAILURE", data: "非噗浪貼文" },
        { status: 400 },
      );
    }

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return Response.json(
        {
          state: "FAILURE",
          data: "資料格式錯誤",
        },
        { status: 400 },
      );
    }

    //限制各則留言的大小及總數
    const tooManyFields = Object.keys(data).length > MAX_FIELDS;
    const tooManyBytes = Object.values(data).some(
      (value) => Buffer.byteLength(value, "utf8") > MAX_PER_FIELD,
    );

    if (tooManyFields || tooManyBytes) {
      return Response.json(
        {
          state: "FAILURE",
          data: "資料量過大，勿超過 1000 則留言或是單筆留言的字數過多",
        },
        { status: 413 },
      );
    }

    // 淨化 HTML 字串，防止 XSS。
    // 白名單設計原因：
    // - `img`：Plurk 留言內容只有文字和表情符號（<img class="emoticon">）。
    // - `img[rndnum]`：Plurk 自訂屬性，記錄骰子的隨機種子，getEmoticon.ts 用它比對骰子結果，必須保留。
    // - `img[class]`：保留 class="emoticon"，讓前端樣式和選取邏輯能識別表情符號。
    // - `br[class]`：useEditPlurks 在換段時插入 class="double-br" 的 <br>，turndownService 靠它判斷段落邊界。
    const sanitizedData = Object.entries(data).reduce<Record<string, string>>(
      (acc, value) => {
        if (typeof value[1] !== "string") return acc;

        acc[value[0]] = sanitizeHtml(value[1], {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          allowedAttributes: {
            img: [
              "src",
              "srcset",
              "alt",
              "title",
              "width",
              "height",
              "loading",
              "class",
              "rndnum",
            ],
            br: ["class"],
          },
        });
        return acc;
      },
      {},
    );

    // 用 SET NX（Not eXists）確保 key 不重複，避免覆蓋其他人正在使用的資料。
    // 最多重試 5 次；正常情況下第一次就會成功，5 次全失敗代表系統異常。
    let key = null;
    for (let i = 0; i < 5; i++) {
      const candidate = generateKey();
      const ok = await redis.set(candidate, "1", {
        nx: true,
        ex: 60 * 60,
      });

      if (ok) {
        key = candidate;
        break;
      }
    }

    if (!key) {
      return Response.json(
        { state: "FAILURE", data: "嘗試生成隨機碼失敗（嘗試次數：5）" },
        { status: 500 },
      );
    }

    // TTL 1 小時：這個功能只是短暫的跨裝置傳輸（掃 QR code 換裝置），
    // 不是長期儲存，資料過期後自動清除，減少 Redis 用量。
    await redis.set(
      key,
      { plurk_id, data: sanitizedData, selectedPlurksIds },
      {
        ex: 60 * 60,
      },
    );

    return Response.json({ state: "SUCCESS", data: key }, { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return Response.json(
      { state: "FAILURE", data: `資料儲存失敗，請稍後再試。${String(error)}` },
      { status: 500 },
    );
  }
}
