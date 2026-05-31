import { NextRequest, NextResponse } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";
import type { TPlurkItem } from "@/types/plurks";
import { GET_PLURKS_URL } from "@/app/api/constants";
import { getSession, deleteSession } from "@/lib/session";

function clearAuthResponse(message: string) {
  const res = NextResponse.json(
    { state: "FAILURE", data: message },
    { status: 401 },
  );
  res.cookies.delete("plurk_session");
  res.cookies.delete("plurk_authed");
  return res;
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("plurk_session")?.value;

  if (!sessionId) {
    return clearAuthResponse("尚未授權");
  }

  const session = await getSession(sessionId);

  if (!session) {
    return clearAuthResponse("授權已失效，請重新授權");
  }

  const { token: accessToken, secret: accessTokenSecret } = session;

  const res = await oauthSignedFetch(
    GET_PLURKS_URL,
    { filter: "my", limit: "15" },
    { key: accessToken, secret: accessTokenSecret },
  );

  if (!res.ok) {
    const data = await res.json();
    // Plurk 回 401/403 代表 token 已失效，刪除 Redis session 並清除 cookie
    if (res.status === 401 || res.status === 403) {
      await deleteSession(sessionId);
      return clearAuthResponse("授權已失效，請重新授權");
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
