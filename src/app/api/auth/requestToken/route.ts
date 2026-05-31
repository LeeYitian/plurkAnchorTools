/**
 * Plurk OAuth 授權流程起點。
 *
 * 步驟：
 * 1. 以當前 request URL 組出 callback URL（/api/auth/callback）
 * 2. 用 consumer key/secret 向 Plurk 換取一次性的 request token，
 *    並將 callback URL 一併送出，讓 Plurk 知道授權完成後要導回哪裡
 * 3. 將 request token secret 暫存於短期 httpOnly cookie（10 分鐘），
 *    callback 時需要它來換取 access token
 * 4. 將使用者的瀏覽器導向 Plurk 授權頁面；
 *    若有傳入 deviceid，一併附上 deviceid 與 model，
 *    讓同一帳號在不同裝置授權時不會互相干擾
 */

import { NextRequest, NextResponse } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";
import { AUTHORIZE_URL, REQUEST_TOKEN_URL } from "@/app/api/constants";

export async function GET(request: NextRequest) {
  const callbackUrl = new URL("/api/auth/callback", request.url).toString();

  const res = await oauthSignedFetch(REQUEST_TOKEN_URL, {
    oauth_callback: callbackUrl,
  });

  if (!res.ok) {
    return Response.json(
      { state: "FAILURE", data: "取得授權碼失敗，請重新授權" },
      { status: 500, headers: { "Set-Cookie": "plurk_authed=; Max-Age=0; path=/" } },
    );
  }

  const params = new URLSearchParams(await res.text());
  const oauthToken = params.get("oauth_token");
  const oauthTokenSecret = params.get("oauth_token_secret");

  if (!oauthToken || !oauthTokenSecret) {
    return Response.json(
      { state: "FAILURE", data: "噗浪回傳資料有誤，請重新授權" },
      { status: 500, headers: { "Set-Cookie": "plurk_authed=; Max-Age=0; path=/" } },
    );
  }

  const deviceId = request.nextUrl.searchParams.get("deviceid") ?? "";
  const authorizeParams = new URLSearchParams({ oauth_token: oauthToken });
  if (deviceId) {
    const ua = request.headers.get("user-agent") ?? "";
    const model = /Android/i.test(ua)
      ? "Android"
      : /iPhone|iPad/i.test(ua)
        ? "iOS"
        : "PC";
    authorizeParams.set("deviceid", deviceId);
    authorizeParams.set("model", model);
  }

  const isLocal = request.url.includes("localhost");
  const response = NextResponse.redirect(
    `${AUTHORIZE_URL}?${authorizeParams.toString()}`,
  );
  response.cookies.set("plurk_request_secret", oauthTokenSecret, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: "lax",
    maxAge: 60 * 10,
  });

  return response;
}
