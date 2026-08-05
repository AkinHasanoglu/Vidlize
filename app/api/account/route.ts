import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
});

export async function PATCH(request: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { fullName: parsed.data.fullName },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.delete({ where: { id: user.id } }).catch(() => {});

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
