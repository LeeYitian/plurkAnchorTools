import { redis } from "@/app/lib/redis";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.get("key");
  if (!params) {
    return Response.json(
      { state: "FAILURE", data: "驗證碼有誤" },
      { status: 400 },
    );
  }

  const data = await redis.get(params);
  if (!data) {
    return Response.json(
      { state: "FAILURE", data: "驗證碼有誤" },
      { status: 400 },
    );
  }

  return Response.json({ state: "SUCCESS", data }, { status: 200 });
}
