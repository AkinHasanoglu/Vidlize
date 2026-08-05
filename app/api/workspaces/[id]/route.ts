import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { assertWorkspaceOwnership, getWorkspaceCreditsUsed } from "@/lib/workspace";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  logoUrl: z.string().url().nullable().optional(),
  creditAllocation: z.number().int().positive().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await assertWorkspaceOwnership(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const workspace = await prisma.workspace.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ workspace: { ...workspace, creditsUsed: await getWorkspaceCreditsUsed(id) } });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await assertWorkspaceOwnership(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.workspace.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
