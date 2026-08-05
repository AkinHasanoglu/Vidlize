import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/apiKey";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(1).max(60) });

export async function GET() {
  if (IS_DEMO) return NextResponse.json({ keys: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, keyPrefix: true, lastUsedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
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

  const { fullKey, keyPrefix, keyHash } = generateApiKey();

  const key = await prisma.apiKey.create({
    data: { userId: user.id, name: parsed.data.name, keyPrefix, keyHash },
    select: { id: true, name: true, keyPrefix: true, createdAt: true },
  });

  // The full key is only ever returned here — we only store its hash.
  return NextResponse.json({ key: { ...key, fullKey } }, { status: 201 });
}
