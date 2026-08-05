import { prisma } from "../../lib/prisma";
import { generateMedia } from "../../lib/fal";
import { refundCredits } from "../../lib/credits";
import { supabaseAdmin } from "../../lib/supabase/admin";
import { notifyWebhook } from "../../lib/webhook";

export async function processGenerationJob(jobId: string): Promise<void> {
  // Mark as PROCESSING
  const job = await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING", attempts: { increment: 1 } },
  });

  let outputUrl: string;
  try {
    const result = await generateMedia({
      outputType: job.outputType,
      sourceImageUrl: job.sourceImageUrl,
      backgroundUrl: job.backgroundUrl,
      customPrompt: job.customPrompt,
      model: job.model,
    });
    outputUrl = result.outputUrl;
  } catch (err) {
    // Re-throw so BullMQ can retry
    throw err;
  }

  // Copy temporary fal.ai URL to Supabase Storage for permanence
  const ext = job.outputType === "UGC_VIDEO" ? "mp4" : "jpg";
  const storagePath = `outputs/${job.userId}/${job.id}.${ext}`;

  try {
    const response = await fetch(outputUrl);
    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    await supabaseAdmin.storage
      .from("ugc-media")
      .upload(storagePath, buffer, {
        contentType: blob.type,
        upsert: true,
      });

    outputUrl = supabaseAdmin.storage
      .from("ugc-media")
      .getPublicUrl(storagePath).data.publicUrl;
  } catch {
    // If storage copy fails, keep the original fal.ai URL (temporary)
  }

  await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "COMPLETED", outputMediaUrl: outputUrl },
  });

  await notifyWebhook(job.userId, {
    event: "job.completed",
    jobId: job.id,
    status: "COMPLETED",
    outputType: job.outputType,
    outputMediaUrl: outputUrl,
  });
}

export async function handleJobFailure(jobId: string, errorMessage: string): Promise<void> {
  const job = await prisma.generationJob.update({
    where: { id: jobId },
    data: { status: "FAILED", errorMessage },
  });

  // Refund credits
  await refundCredits(job.userId, job.creditsCost);

  await notifyWebhook(job.userId, {
    event: "job.failed",
    jobId: job.id,
    status: "FAILED",
    outputType: job.outputType,
    errorMessage,
  });
}
