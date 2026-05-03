import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { redis } from "@/app/unit/lib/redis";
import sanitizeHtml from "sanitize-html";

function generateKey() {
  return randomBytes(8).toString("base64url").replace(/[-_]/g, "").slice(0, 6);
}

//可能需要壓縮文字。前端傳進來的時候就壓縮？可考慮 lz-string.js
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
    }: {
      data: Record<string, string>;
      plurk_id: number;
    } = JSON.parse(raw);

    //驗證噗文確實存在
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

    //淨化 HTML 字串
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
            ],
            br: ["class"],
          },
        });
        return acc;
      },
      {},
    );

    //避免隨機碼重複直接覆蓋既有資料
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

    await redis.set(
      key,
      { plurk_id, data: sanitizedData },
      {
        ex: 60 * 60,
      },
    );

    return Response.json({ state: "SUCCESS", data: key }, { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return Response.json(
      { state: "FAILURE", data: String(error) },
      { status: 500 },
    );
  }
}
