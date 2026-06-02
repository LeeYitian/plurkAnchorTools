import crypto from "crypto";
import OAuth from "oauth-1.0a";

/**
 * 為什麼每次請求都新建 OAuth client？
 * 環境變數（PLURK_CONSUMER_KEY/SECRET）在 Edge Runtime 的模組載入階段
 * 不一定能取得，每次呼叫時才讀取可確保拿到正確的值。
 * createOAuthClient 很輕量，每次重建沒有顯著效能影響。
 */
function createOAuthClient() {
  return new OAuth({
    consumer: {
      key: process.env.PLURK_CONSUMER_KEY!,
      secret: process.env.PLURK_CONSUMER_SECRET!,
    },
    // Plurk OAuth 1.0a 只支援 HMAC-SHA1，不支援 RSA 或 PLAINTEXT
    signature_method: "HMAC-SHA1",
    hash_function: (base, key) =>
      crypto.createHmac("sha1", key).update(base).digest("base64"),
  });
}

/**
 * 產生帶有 OAuth 1.0a Authorization header 的 POST 請求。
 *
 * 為什麼 Content-Type 必須是 application/x-www-form-urlencoded？
 * OAuth 1.0a 的簽章計算涵蓋 request body 的內容，
 * 只有 form-encoded 格式的 body 才會被納入簽章基底字串（signature base string）。
 * 若改成 JSON body，Plurk 伺服器驗簽時會因 body 參數不符而回 401。
 *
 * token 參數在請求 request token 時不需要傳（尚未有 token），
 * 換取 access token 時才傳入 request token 做為授權憑據。
 */
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
