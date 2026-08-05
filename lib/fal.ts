import { fal } from "@fal-ai/client";
import type { OutputType } from "@prisma/client";
import { isValidModel } from "./modelOptions";

fal.config({ credentials: process.env.FAL_KEY });

const MODEL_IDS: Record<OutputType, string> = {
  UGC_PHOTO: "fal-ai/flux/dev",
  UGC_VIDEO: "fal-ai/kling-video/v1/standard/image-to-video",
  LIFESTYLE: "fal-ai/flux/dev",
};

interface GenerateParams {
  outputType: OutputType;
  sourceImageUrl: string;
  backgroundUrl?: string | null;
  customPrompt?: string | null;
  model?: string | null;
}

interface GenerateResult {
  outputUrl: string;
}

function buildPrompt(params: GenerateParams): string {
  const { outputType, backgroundUrl, customPrompt } = params;

  const basePrompts: Record<OutputType, string> = {
    UGC_PHOTO:
      "UGC-style product photo, natural lifestyle setting, authentic feel, person holding or using the product, warm soft lighting, social media aesthetic",
    UGC_VIDEO:
      "UGC-style product video, authentic lifestyle content, natural movement, person showcasing product, social media quality",
    LIFESTYLE:
      "Professional lifestyle product scene, beautifully arranged, editorial quality, aspirational setting, clean and modern composition",
  };

  let prompt = basePrompts[outputType];
  if (backgroundUrl) prompt += `, styled background matching the product`;
  if (customPrompt) prompt += `, ${customPrompt}`;
  return prompt;
}

export async function generateMedia(params: GenerateParams): Promise<GenerateResult> {
  const modelId =
    params.model && isValidModel(params.outputType, params.model)
      ? params.model
      : MODEL_IDS[params.outputType];
  const prompt = buildPrompt(params);

  if (params.outputType === "UGC_VIDEO") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (fal as any).subscribe(modelId, {
      input: { prompt, image_url: params.sourceImageUrl, duration: "5" },
      logs: false,
    });

    const url = result?.video?.url as string | undefined;
    if (!url) throw new Error("No video URL in fal.ai response");
    return { outputUrl: url };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (fal as any).subscribe(modelId, {
    input: {
      prompt,
      image_url: params.sourceImageUrl,
      image_size: "square_hd",
      num_images: 1,
      num_inference_steps: 28,
      guidance_scale: 3.5,
    },
    logs: false,
  });

  const url = result?.images?.[0]?.url as string | undefined;
  if (!url) throw new Error("No image URL in fal.ai response");
  return { outputUrl: url };
}
