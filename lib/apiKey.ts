import crypto from "node:crypto";
import { prisma } from "./prisma";

const KEY_PREFIX = "ugc_live_";

export function generateApiKey(): { fullKey: string; keyPrefix: string; keyHash: string } {
  const random = crypto.randomBytes(24).toString("base64url");
  const fullKey = `${KEY_PREFIX}${random}`;
  const keyPrefix = fullKey.slice(0, KEY_PREFIX.length + 6);
  const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, keyPrefix, keyHash };
}

/** Resolves a raw `Authorization: Bearer <key>` value to the owning userId, or null. */
export async function resolveApiKey(rawKey: string): Promise<string | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) return null;

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
  return apiKey.userId;
}
