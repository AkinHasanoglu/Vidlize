import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse } from "next/server";

export async function GET() {
  if (IS_DEMO) return NextResponse.json({ connections: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connections = await prisma.storeConnection.findMany({
    where: { userId: user.id },
    select: { id: true, platform: true, shopDomain: true, status: true, createdAt: true },
  });

  return NextResponse.json({ connections });
}
