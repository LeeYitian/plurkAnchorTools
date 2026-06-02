import { NextRequest } from "next/server";

/**
 * 取得一則噗文的噗首 + 所有回應，合併成陣列回傳。
 * 用 36 進位的 id 取得噗文內容 ，非 36 進位的 id 取回噗首
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json(
      { state: "FAILURE", data: "Missing plurk_id" },
      { status: 400 },
    );
  }

  // Plurk URL 使用 36 進位 id，但 Responses/get API 需要 10 進位
  const plurk_id = parseInt(id, 36).toString();

  try {
    const formData = new FormData();
    formData.append("plurk_id", plurk_id);
    formData.append("from_response_id", "0");
    const plurksResponse = await fetch("https://www.plurk.com/Responses/get", {
      method: "POST",
      body: formData,
    });
    const plurksData = await plurksResponse.json();

    // Responses/get 不含噗首，必須另外抓 HTML 頁面再解析
    const headPlurkResponse = await fetch(`https://www.plurk.com/p/${id}`);
    const headPlurkText = await headPlurkResponse.text();

    // 噗首資料被嵌在 <script> 內的 JS 變數 `plurk = {...}` 裡
    const headPlurkRegex = /plurk\s*=\s*\{[\s\S]*?\}/g;
    let headPlurkData = headPlurkText.match(headPlurkRegex)?.[0];
    if (headPlurkData) {
      headPlurkData = headPlurkData.replace("plurk =", "");

      // Plurk 的日期欄位是 `new Date(...)` 格式，不是合法 JSON，需先轉換成字串
      headPlurkData = headPlurkData.replace(
        /new Date\((.*?)\)/g,
        (_, dateStr) => {
          return JSON.stringify(eval(dateStr));
        },
      );
      const headPlurkJson = JSON.parse(headPlurkData);
      // 噗首放在陣列第 0 項，其餘依時間順序為回應
      const data = [headPlurkJson, ...plurksData.responses];
      return Response.json({ state: "SUCCESS", data }, { status: 200 });
    } else {
      // 解析失敗（例如噗文不存在或格式變動）時，只回傳留言部分，不含噗首
      return Response.json(
        { state: "SUCCESS", data: [...plurksData.responses] },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching Plurks:", error);
    return Response.json(
      { state: "FAILURE", data: `取得噗文失敗，請稍後再試。${String(error)}` },
      { status: 500 },
    );
  }
}
