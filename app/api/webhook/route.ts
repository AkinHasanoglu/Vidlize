import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateWebhookSecret } from "@/lib/webhook";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({ url: z.string().url() });

export async function GET() {
  if (IS_DEMO) return NextResponse.json({ endpoint: null });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const endpoint = await prisma.webhookEndpoint.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ endpoint });
}

export async function POST(request: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const endpoint = await prisma.webhookEndpoint.upsert({
    where: { userId: user.id },
    create: { userId: user.id, url: parsed.data.url, secret: generateWebhookSecret() },
    update: { url: parsed.data.url },
  });

  return NextResponse.json({ endpoint });
}

export async function DELETE() {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.webhookEndpoint.delete({ where: { userId: user.id } }).catch(() => {});

  return NextResponse.json({ ok: true });
}
