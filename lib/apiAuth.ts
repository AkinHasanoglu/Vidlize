import type { NextRequest } from "next/server";
import { resolveApiKey } from "./apiKey";

/** Authenticates a request via `Authorization: Bearer <api_key>`, returning the owning userId or null. */
export async function authenticateApiRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const key = authHeader.slice("Bearer ".length).trim();
  if (!key) return null;
  return resolveApiKey(key);
}
