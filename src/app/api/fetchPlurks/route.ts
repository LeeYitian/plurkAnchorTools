import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return Response.json(
      { state: "FAILURE", data: "Missing plurk_id" },
      { status: 400 }
    );
  }

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

    //用另一支 api 取得噗首內容(這個 api 會回傳一個 html 頁面)
    const headPlurkResponse = await fetch(`https://www.plurk.com/p/${id}`);
    const headPlurkText = await headPlurkResponse.text();
    // 找出噗首內容的 JSON 資料(原本是包在 <script> 標籤內的)
    const headPlurkRegex = /plurk\s*=\s*\{[\s\S]*?\}/g;
    let headPlurkData = headPlurkText.match(headPlurkRegex)?.[0];
    if (headPlurkData) {
      headPlurkData = headPlurkData.replace("plurk =", "");
      // 將 new Date(...) 轉換成字串
      headPlurkData = headPlurkData.replace(
        /new Date\((.*?)\)/g,
        (_, dateStr) => {
          return JSON.stringify(eval(dateStr));
        }
      );
      const headPlurkJson = JSON.parse(headPlurkData);
      const data = [headPlurkJson, ...plurksData.responses];
      return Response.json({ state: "SUCCESS", data }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching Plurks:", error);
    return Response.json(
      { state: "FAILURE", data: String(error) },
      { status: 500 }
    );
  }
}
