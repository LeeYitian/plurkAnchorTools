/**
 * Plurk OAuth callback handler。
 * 收到 Plurk 在授權完成後導回的 oauth_token 與 oauth_verifier，
 * 搭配暫存的 request token secret 換取永久 access token，
 * 將 token 寫入 httpOnly cookie。
 *
 * 成功與失敗都回傳內嵌 script 的 HTML（而非 redirect 或 JSON）：
 * - postMessage 是瀏覽器 API，只能在 client 執行，server route 無法直接呼叫
 * - 讓瀏覽器載入這段 HTML 後由 script 完成剩餘工作：
 *   成功 → 通知主視窗授權完成，popup 關閉自己
 *   失敗 → 通知主視窗顯示錯誤訊息，popup 關閉自己
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
  const origin = new URL(request.url).origin;

  // 錯誤一律回傳 HTML script，讓 popup 通知主視窗顯示錯誤後關閉自己，
  // 避免 popup 卡住顯示 raw JSON 讓使用者不知所措
  const errorHtml = (message: string) =>
    new Response(
      `<script>
        window.opener?.postMessage({ type: "OAUTH_ERROR", message: "${message}" }, "${origin}");
        window.close();
      </script>`,
      { headers: { "Content-Type": "text/html" } },
    );

  if (!oauthToken || !oauthVerifier || !requestSecret) {
    return errorHtml("缺少授權參數");
  }

  const res = await oauthSignedFetch(
    ACCESS_TOKEN_URL,
    { oauth_verifier: oauthVerifier },
    { key: oauthToken, secret: requestSecret },
  );

  if (!res.ok) {
    return errorHtml("取得存取權杖失敗，請重新授權");
  }

  const params = new URLSearchParams(await res.text());
  const accessToken = params.get("oauth_token");
  const accessTokenSecret = params.get("oauth_token_secret");

  if (!accessToken || !accessTokenSecret) {
    return errorHtml("噗浪回傳資料有誤，請重新授權");
  }

  // 回傳 HTML，讓 popup 裡的 script 通知主視窗授權完成後關閉自己。
  // 使用 origin 限制 postMessage 的目標，避免訊息被其他網站接收。
  // 若使用者直接在瀏覽器開啟此網址（opener 不存在），則 fallback 導回 /chunk。
  const html = `<script>
    if (window.opener) {
      window.opener.postMessage({ type: "OAUTH_COMPLETE" }, "${origin}");
      window.close();
    } else {
      window.location.href = "/chunk";
    }
  </script>`;

  const response = new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
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
