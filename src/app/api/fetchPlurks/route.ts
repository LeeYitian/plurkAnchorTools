import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  console.log("plurk_id:", id);
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
    const response = await fetch("https://www.plurk.com/Responses/get", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return Response.json(
      { state: "SUCCESS", data },
      { status: response.status }
    );
  } catch (error) {
    console.error("Error fetching Plurks:", error);
    return Response.json(
      { state: "FAILURE", data: String(error) },
      { status: 500 }
    );
  }
}
