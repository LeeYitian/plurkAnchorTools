import { redis } from "@/lib/redis";
import { ONE_MONTH } from "@/app/api/constants";

type SessionData = { token: string; secret: string };

export async function createSession(
  token: string,
  secret: string,
): Promise<string> {
  const sessionId = crypto.randomUUID();
  await redis.set(`session:${sessionId}`, { token, secret }, { ex: ONE_MONTH });
  return sessionId;
}

export async function getSession(
  sessionId: string,
): Promise<SessionData | null> {
  return redis.get<SessionData>(`session:${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}
