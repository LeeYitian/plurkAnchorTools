/**
 * Plurk OAuth callback handler。
 * 收到 Plurk 在授權完成後導回的 oauth_token 與 oauth_verifier，
 * 搭配暫存的 request token secret 換取永久 access token，
 * 將 token 寫入 httpOnly cookie，然後導向中繼頁 /auth/complete。
 *
 * 成功與失敗都導向 /auth/complete，由該頁顯示結果並讓使用者關閉 popup。
 * 錯誤訊息透過 query string 傳入，不需要 postMessage。
 */

import { NextRequest, NextResponse } from "next/server";
import { oauthSignedFetch } from "@/app/chunk/utils/oauthSignedFetch";
import { ACCESS_TOKEN_URL, ONE_MONTH } from "@/app/api/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");
  const requestSecret = request.cookies.get("plurk_request_secret")?.value;
  const isLocal = request.url.includes("localhost");
  const secure = !isLocal;

  const errorRedirect = (message: string) =>
    NextResponse.redirect(
      new URL(`/auth/complete?error=${encodeURIComponent(message)}`, request.url),
    );

  if (!oauthToken || !oauthVerifier || !requestSecret) {
    return errorRedirect("缺少授權參數");
  }

  const res = await oauthSignedFetch(
    ACCESS_TOKEN_URL,
    { oauth_verifier: oauthVerifier },
    { key: oauthToken, secret: requestSecret },
  );

  if (!res.ok) {
    return errorRedirect("取得存取權杖失敗，請重新授權");
  }

  const params = new URLSearchParams(await res.text());
  const accessToken = params.get("oauth_token");
  const accessTokenSecret = params.get("oauth_token_secret");

  if (!accessToken || !accessTokenSecret) {
    return errorRedirect("噗浪回傳資料有誤，請重新授權");
  }

  const response = NextResponse.redirect(new URL("/auth/complete", request.url));
  response.cookies.set("plurk_access_token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: ONE_MONTH,
  });
  response.cookies.set("plurk_access_token_secret", accessTokenSecret, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: ONE_MONTH,
  });
  response.cookies.set("plurk_authed", "true", {
    httpOnly: false,
    secure,
    sameSite: "lax",
    maxAge: ONE_MONTH,
  });
  response.cookies.delete("plurk_request_secret");

  return response;
}
