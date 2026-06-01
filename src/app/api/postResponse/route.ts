import { NextRequest, NextResponse } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/lib/oauth";
import { RESPONSE_ADD_URL } from "@/app/api/constants";
import { getSession, deleteSession } from "@/lib/session";

function clearAuthResponse(message: string, sentCount = 0) {
  const res = NextResponse.json(
    { state: "FAILURE", data: { message, sentCount } },
    { status: 401 },
  );
  res.cookies.delete("plurk_session");
  res.cookies.delete("plurk_authed");
  return res;
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("plurk_session")?.value;

  if (!sessionId) {
    return clearAuthResponse("尚未授權");
  }

  const session = await getSession(sessionId);

  if (!session) {
    return clearAuthResponse("授權已失效，請重新授權");
  }

  const { token: accessToken, secret: accessTokenSecret } = session;

  const { plurk_id, contents } = await request.json();

  if (!plurk_id || !Array.isArray(contents) || contents.length === 0) {
    return Response.json(
      { state: "FAILURE", data: { message: "缺少必要參數" } },
      { status: 400 },
    );
  }

  let sentCount = 0;
  for (const content of contents) {
    const res = await oauthSignedFetch(
      RESPONSE_ADD_URL,
      { plurk_id, content, qualifier: ":" },
      { key: accessToken, secret: accessTokenSecret },
    );

    if (!res.ok) {
      const data = await res.json();
      // Plurk 回 401/403 代表 token 已失效，刪除 Redis session 並清除 cookie
      if (res.status === 401 || res.status === 403) {
        await deleteSession(sessionId);
        return clearAuthResponse("授權已失效，請重新授權", sentCount);
      }
      // 其他錯誤（invalid plurk_id 等）帶入 Plurk 的錯誤訊息，授權狀態不變
      return Response.json(
        {
          state: "FAILURE",
          data: { message: data["error_text"] || "留言發送失敗", sentCount },
        },
        { status: 400 },
      );
    }
    sentCount++;
  }

  return Response.json({ state: "SUCCESS", data: { sentCount } });
}
