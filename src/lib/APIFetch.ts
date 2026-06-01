import { NETWORK_ERROR_PREFIXES } from "@/types/constants";

export type APISuccess<T> = { ok: true; data: T; status: number };
export type APIError<E = string> = { ok: false; data: E; status: number };
export type APIResult<T, E = string> = APISuccess<T> | APIError<E>;

function networkErrorMessage(url: string, error: unknown): string {
  const pathname = url.split("?")[0];
  const prefix = NETWORK_ERROR_PREFIXES[pathname] ?? "網路連線失敗，請稍後再試。";
  return `${prefix}${String(error)}`;
}

/**
 * 統一的 fetch wrapper，把 try-catch、res.ok 判斷、json 解析集中處理。
 *
 * - 成功：`{ ok: true, data: body.data, status }`
 * - API 回 4xx/5xx：`{ ok: false, data: body.data, status }`
 * - 網路錯誤（請求未送達）：`{ ok: false, data: <友善前綴 + String(error)>, status: 0 }`
 *
 * @param onNetworkError data 型別需為物件時（例如 postResponse）才傳，用來覆蓋預設的字串訊息
 */
export async function APIFetch<T, E = string>(
  url: string,
  options?: RequestInit,
  onNetworkError?: (error: unknown) => E,
): Promise<APIResult<T, E>> {
  try {
    const res = await fetch(url, options);
    const body = await res.json();
    if (!res.ok) return { ok: false, data: body.data as E, status: res.status };
    return { ok: true, data: body.data as T, status: res.status };
  } catch (error) {
    const data = onNetworkError
      ? onNetworkError(error)
      : (networkErrorMessage(url, error) as unknown as E);
    return { ok: false, data, status: 0 };
  }
}
