import { NextRequest } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";

const RESPONSE_ADD_URL = "https://www.plurk.com/APP/Responses/responseAdd";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("plurk_access_token")?.value;
  const accessTokenSecret = request.cookies.get(
    "plurk_access_token_secret",
  )?.value;

  if (!accessToken || !accessTokenSecret) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { plurk_id, content } = await request.json();

  if (!plurk_id || !content) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  const res = await oauthSignedFetch(
    RESPONSE_ADD_URL,
    { plurk_id, content, qualifier: ":" },
    { key: accessToken, secret: accessTokenSecret },
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to post response" }, { status: 500 });
  }

  return Response.json({ state: "SUCCESS" });
}
