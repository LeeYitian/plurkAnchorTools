import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.get("key");

  return Response.json({ state: "SUCCESS", data: "" }, { status: 200 });
}
