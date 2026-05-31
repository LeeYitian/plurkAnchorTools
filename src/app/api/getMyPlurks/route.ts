import { NextRequest } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";
import type { TPlurkItem } from "@/types/plurks";
import { GET_PLURKS_URL } from "@/app/api/constants";

export async function GET(request: NextRequest) {
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

  const res = await oauthSignedFetch(
    GET_PLURKS_URL,
    { filter: "my", limit: "15" },
    { key: accessToken, secret: accessTokenSecret },
  );

  if (!res.ok) {
    const data = await res.json();
    // Plurk 回 401/403 代表 token 已失效，清除 cookie 並通知前端清除授權狀態
    if (res.status === 401 || res.status === 403) {
      return Response.json(
        { state: "FAILURE", data: "授權已失效，請重新授權" },
        {
          status: 401,
          headers: { "Set-Cookie": "plurk_authed=; Max-Age=0; path=/" },
        },
      );
    }
    // 其他錯誤（如 Plurk 服務故障）不清授權，不讓使用者白白被登出
    return Response.json(
      {
        state: "FAILURE",
        data: data["error_text"] || "取得噗文清單失敗，請稍後再試",
      },
      { status: 502 },
    );
  }

  const data = await res.json();
  const plurks: TPlurkItem[] = (data.plurks ?? []).filter(
    (p: TPlurkItem & { content: string }) =>
      p.content_raw?.includes("安價") || p.content?.includes("安價"),
  );

  return Response.json({ state: "SUCCESS", data: plurks });
}
