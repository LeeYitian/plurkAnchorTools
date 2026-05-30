import { NextRequest } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";
import type { TPlurkItem } from "@/types/plurks";

const GET_PLURKS_URL = "https://www.plurk.com/APP/Timeline/getPlurks";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("plurk_access_token")?.value;
  const accessTokenSecret =
    request.cookies.get("plurk_access_token_secret")?.value;

  if (!accessToken || !accessTokenSecret) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await oauthSignedFetch(
    GET_PLURKS_URL,
    { filter: "my", limit: "20" },
    { key: accessToken, secret: accessTokenSecret },
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to fetch plurks" }, { status: 500 });
  }

  const data = await res.json();
  const plurks: TPlurkItem[] = (data.plurks ?? []).filter(
    (p: TPlurkItem & { content: string }) =>
      p.content_raw?.includes("安價") || p.content?.includes("安價"),
  );

  return Response.json({ state: "SUCCESS", data: plurks });
}
