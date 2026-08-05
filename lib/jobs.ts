import { prisma } from "@/lib/prisma";
import { getGenerationQueue } from "@/lib/queue";
import { CREDIT_COSTS, deductCredits, refundCredits } from "@/lib/credits";
import { assertWorkspaceOwnership, getWorkspaceCreditsUsed } from "@/lib/workspace";
import { isValidModel } from "@/lib/modelOptions";
import type { OutputType, BgType } from "@prisma/client";

export interface CreateJobParams {
  userId: string;
  outputType: OutputType;
  backgroundType: BgType;
  sourceImageUrl: string;
  backgroundUrl?: string;
  customPrompt?: string;
  workspaceId?: string | null;
  model?: string | null;
}

export type CreateJobResult =
  | { ok: true; jobId: string }
  | { ok: false; status: 402 | 404; error: string };

/**
 * Shared job-creation path used by both the authenticated session API (/api/jobs)
 * and the public API-key endpoint (/api/v1/jobs) — keeps credit deduction, workspace
 * allocation checks, and refund-on-failure consistent across both entry points.
 */
export async function createGenerationJob(params: CreateJobParams): Promise<CreateJobResult> {
  const { userId, outputType, backgroundType, sourceImageUrl, backgroundUrl, customPrompt, workspaceId, model } =
    params;
  const creditsCost = CREDIT_COSTS[outputType];

  if (workspaceId) {
    const workspace = await assertWorkspaceOwnership(workspaceId, userId);
    if (!workspace) return { ok: false, status: 404, error: "Workspace not found" };
    if (workspace.creditAllocation != null) {
      const used = await getWorkspaceCreditsUsed(workspaceId);
      if (used + creditsCost > workspace.creditAllocation) {
        return { ok: false, status: 402, error: "Workspace credit allocation exceeded" };
      }
    }
  }

  try {
    await deductCredits(userId, creditsCost);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "INSUFFICIENT_CREDITS") {
      return { ok: false, status: 402, error: "Insufficient credits" };
    }
    throw e;
  }

  const validModel = model && isValidModel(outputType, model) ? model : undefined;

  let job;
  try {
    job = await prisma.generationJob.create({
      data: {
        userId,
        workspaceId: workspaceId ?? undefined,
        outputType,
        backgroundType,
        sourceImageUrl,
        backgroundUrl,
        customPrompt,
        creditsCost,
        model: validModel,
      },
    });
  } catch (e) {
    await refundCredits(userId, creditsCost);
    throw e;
  }

  await getGenerationQueue().add("generate", { jobId: job.id });

  return { ok: true, jobId: job.id };
}
