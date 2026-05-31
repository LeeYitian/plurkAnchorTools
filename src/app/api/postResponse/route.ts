import { NextRequest } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";

const RESPONSE_ADD_URL = "https://www.plurk.com/APP/Responses/responseAdd";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("plurk_access_token")?.value;
  const accessTokenSecret = request.cookies.get(
    "plurk_access_token_secret",
  )?.value;

  if (!accessToken || !accessTokenSecret) {
    return Response.json({ state: "FAILURE", data: "尚未授權" }, { status: 401 });
  }

  const { plurk_id, content } = await request.json();

  if (!plurk_id || !content) {
    return Response.json({ state: "FAILURE", data: "缺少必要參數" }, { status: 400 });
  }

  const res = await oauthSignedFetch(
    RESPONSE_ADD_URL,
    { plurk_id, content, qualifier: ":" },
    { key: accessToken, secret: accessTokenSecret },
  );

  if (!res.ok) {
    return Response.json(
      { state: "FAILURE", data: "留言發送失敗，請重新授權" },
      { status: 500, headers: { "Set-Cookie": "plurk_authed=; Max-Age=0; path=/" } },
    );
  }

  return Response.json({ state: "SUCCESS" });
}
