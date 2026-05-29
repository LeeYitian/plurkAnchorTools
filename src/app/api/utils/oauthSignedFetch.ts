import crypto from "crypto";
import OAuth from "oauth-1.0a";

function createOAuthClient() {
  return new OAuth({
    consumer: {
      key: process.env.PLURK_CONSUMER_KEY!,
      secret: process.env.PLURK_CONSUMER_SECRET!,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (base, key) =>
      crypto.createHmac("sha1", key).update(base).digest("base64"),
  });
}

export async function oauthSignedFetch(
  url: string,
  data: Record<string, string>,
  token?: { key: string; secret: string },
): Promise<Response> {
  const oauth = createOAuthClient();
  const authHeader = oauth.toHeader(
    oauth.authorize({ url, method: "POST", data }, token),
  );

  return fetch(url, {
    method: "POST",
    headers: {
      ...authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data).toString(),
  });
}
