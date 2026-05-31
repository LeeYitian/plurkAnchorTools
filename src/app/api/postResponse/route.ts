import { NextRequest } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";
import { RESPONSE_ADD_URL } from "@/app/api/constants";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("plurk_access_token")?.value;
  const accessTokenSecret = request.cookies.get(
    "plurk_access_token_secret",
  )?.value;

  if (!accessToken || !accessTokenSecret) {
    return Response.json(
      { state: "FAILURE", data: "尚未授權" },
      {
        status: 401,
        headers: { "Set-Cookie": "plurk_authed=; Max-Age=0; path=/" },
      },
    );
  }

  const { plurk_id, content } = await request.json();

  if (!plurk_id || !content) {
    return Response.json(
      { state: "FAILURE", data: "缺少必要參數" },
      { status: 400 },
    );
  }

  const res = await oauthSignedFetch(
    RESPONSE_ADD_URL,
    { plurk_id, content, qualifier: ":" },
    { key: accessToken, secret: accessTokenSecret },
  );

  if (!res.ok) {
    const data = await res.json();
    // Plurk 回 401/403 代表 token 已失效，清除 cookie 並通知前端清除授權狀態
    if (res.status === 401 || res.status === 403) {
      return Response.json(
        { state: "FAILURE", data: "授權已失效，請重新授權" },
        { status: 401, headers: { "Set-Cookie": "plurk_authed=; Max-Age=0; path=/" } },
      );
    }
    // 其他錯誤（invalid plurk_id 等）帶入 Plurk 的錯誤訊息，授權狀態不變
    return Response.json(
      { state: "FAILURE", data: data["error_text"] || "留言發送失敗" },
      { status: 400 },
    );
  }

  return Response.json({ state: "SUCCESS" });
}
