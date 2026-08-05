import { prisma } from "./prisma";

export const ACTIVE_WORKSPACE_COOKIE = "activeWorkspaceId";

export async function getActiveWorkspaceId(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null;
}

/** Confirms a workspace exists and belongs to the given user. */
export async function assertWorkspaceOwnership(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId },
  });
  return workspace;
}

/** Credits already committed to a workspace (excludes failed jobs, which get refunded). */
export async function getWorkspaceCreditsUsed(workspaceId: string): Promise<number> {
  const result = await prisma.generationJob.aggregate({
    where: { workspaceId, status: { not: "FAILED" } },
    _sum: { creditsCost: true },
  });
  return result._sum.creditsCost ?? 0;
}
