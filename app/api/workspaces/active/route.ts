import { createClient } from "@/lib/supabase/server";
import { assertWorkspaceOwnership, ACTIVE_WORKSPACE_COOKIE } from "@/lib/workspace";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({ workspaceId: z.string().nullable() });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { workspaceId } = parsed.data;
  if (workspaceId) {
    const owned = await assertWorkspaceOwnership(workspaceId, user.id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  if (workspaceId) {
    response.cookies.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    response.cookies.delete(ACTIVE_WORKSPACE_COOKIE);
  }
  return response;
}
