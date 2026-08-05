import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceCreditsUsed } from "@/lib/workspace";
import { IS_DEMO } from "@/lib/demo";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#8B5CF6"),
  logoUrl: z.string().url().nullable().optional(),
  creditAllocation: z.number().int().positive().nullable().optional(),
});

export async function GET() {
  if (IS_DEMO) return NextResponse.json({ workspaces: [] });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const withUsage = await Promise.all(
    workspaces.map(async (w) => ({
      ...w,
      creditsUsed: await getWorkspaceCreditsUsed(w.id),
    }))
  );

  return NextResponse.json({ workspaces: withUsage });
}

export async function POST(request: NextRequest) {
  if (IS_DEMO) {
    return NextResponse.json({ error: "Not available in demo mode" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const workspace = await prisma.workspace.create({
    data: { ownerId: user.id, ...parsed.data },
  });

  return NextResponse.json({ workspace: { ...workspace, creditsUsed: 0 } }, { status: 201 });
}
