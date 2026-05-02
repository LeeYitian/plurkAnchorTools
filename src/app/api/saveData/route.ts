import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { redis } from "@/app/unit/lib/redis";
import sanitizeHtml from "sanitize-html";

function generateKey() {
  return randomBytes(8).toString("base64url").replace(/[-_]/g, "").slice(0, 6);
}

//可能需要壓縮文字。前端傳進來的時候就壓縮？可考慮 lz-string.js
export async function POST(request: NextRequest) {
  const { data, plurk_id }: { data: Record<string, string>; plurk_id: number } =
    await request.json();

  try {
    //第一關驗證噗文確實存在
    const id = plurk_id.toString(36);
    const headPlurkResponse = await fetch(`https://www.plurk.com/p/${id}`);
    if (headPlurkResponse.status !== 200) {
      return Response.json(
        { state: "FAILURE", data: "Plurk not found" },
        { status: 400 },
      );
    }

    const sanitizedData = Object.entries(data).reduce<Record<string, string>>(
      (acc, value) => {
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

    let key;
    //避免隨機碼重複直接覆蓋既有資料
    do {
      key = generateKey();
    } while (await redis.exists(key));

    await redis.set(key, sanitizedData, {
      ex: 60 * 60,
    });
    return Response.json({ state: "SUCCESS", data: key }, { status: 200 });
  } catch (error) {
    console.error("Error saving data:", error);
    return Response.json(
      { state: "FAILURE", data: String(error) },
      { status: 500 },
    );
  }
}
