import crypto from "node:crypto";
import { prisma } from "./prisma";

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("base64url")}`;
}

/**
 * Best-effort webhook delivery — no retry queue in this MVP. Signed with HMAC-SHA256
 * so the receiver can verify the payload came from us (header: X-UGC-Signature).
 */
export async function notifyWebhook(userId: string, payload: Record<string, unknown>): Promise<void> {
  const endpoint = await prisma.webhookEndpoint.findUnique({ where: { userId } });
  if (!endpoint) return;

  const body = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", endpoint.secret).update(body).digest("hex");

  try {
    await fetch(endpoint.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-UGC-Signature": signature },
      body,
    });
  } catch {
    // Best-effort delivery; failures are not retried in this MVP.
  }
}
