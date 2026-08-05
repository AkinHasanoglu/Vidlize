import { createGenerationJob } from "@/lib/jobs";
import { authenticateApiRequest } from "@/lib/apiAuth";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { OutputType, BgType } from "@prisma/client";

const schema = z.object({
  outputType: z.enum(["UGC_PHOTO", "UGC_VIDEO", "LIFESTYLE"]),
  backgroundType: z.enum(["NONE", "STOCK", "CUSTOM"]),
  sourceImageUrl: z.string().url(),
  backgroundUrl: z.string().url().optional(),
  customPrompt: z.string().max(500).optional(),
  model: z.string().optional(),
});

/**
 * Public API — create a generation job with an API key instead of a session cookie.
 * See /developer in the dashboard for keys and docs.
 */
export async function POST(request: NextRequest) {
  const userId = await authenticateApiRequest(request);
  if (!userId) return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await createGenerationJob({
    userId,
    outputType: parsed.data.outputType as OutputType,
    backgroundType: parsed.data.backgroundType as BgType,
    sourceImageUrl: parsed.data.sourceImageUrl,
    backgroundUrl: parsed.data.backgroundUrl,
    customPrompt: parsed.data.customPrompt,
    model: parsed.data.model,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ jobId: result.jobId }, { status: 201 });
}
