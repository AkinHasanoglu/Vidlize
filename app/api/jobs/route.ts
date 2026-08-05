import { createClient } from "@/lib/supabase/server";
import { createGenerationJob } from "@/lib/jobs";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { OutputType, BgType } from "@prisma/client";

const schema = z.object({
  outputType: z.enum(["UGC_PHOTO", "UGC_VIDEO", "LIFESTYLE"]),
  backgroundType: z.enum(["NONE", "STOCK", "CUSTOM"]),
  sourceImageUrl: z.string().url(),
  backgroundUrl: z.string().url().optional(),
  customPrompt: z.string().max(500).optional(),
  workspaceId: z.string().nullable().optional(),
  model: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await createGenerationJob({
    userId: user.id,
    outputType: parsed.data.outputType as OutputType,
    backgroundType: parsed.data.backgroundType as BgType,
    sourceImageUrl: parsed.data.sourceImageUrl,
    backgroundUrl: parsed.data.backgroundUrl,
    customPrompt: parsed.data.customPrompt,
    workspaceId: parsed.data.workspaceId,
    model: parsed.data.model,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ jobId: result.jobId }, { status: 201 });
}
