import { Redis } from "@upstash/redis";

// Initialize Redis
export const redis = new Redis({
  url: process.env.PLURKAT_KV_REST_API_URL,
  token: process.env.PLURKAT_KV_REST_API_TOKEN,
});
