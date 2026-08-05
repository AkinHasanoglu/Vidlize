import type { OutputType } from "@prisma/client";

export interface ModelOption {
  id: string;
  labelKey: string;
}

// Kept to models within the same family per output type (identical input schema),
// since swapping to an unrelated model can require different input fields.
// Safe to import from client components — no server-only dependencies.
export const IMAGE_MODEL_OPTIONS: ModelOption[] = [
  { id: "fal-ai/flux/dev", labelKey: "fluxDev" },
  { id: "fal-ai/flux/schnell", labelKey: "fluxSchnell" },
  { id: "fal-ai/flux-pro/v1.1", labelKey: "fluxPro" },
];

export const VIDEO_MODEL_OPTIONS: ModelOption[] = [
  { id: "fal-ai/kling-video/v1/standard/image-to-video", labelKey: "klingStandard" },
  { id: "fal-ai/kling-video/v1/pro/image-to-video", labelKey: "klingPro" },
];

export function modelOptionsFor(outputType: OutputType): ModelOption[] {
  return outputType === "UGC_VIDEO" ? VIDEO_MODEL_OPTIONS : IMAGE_MODEL_OPTIONS;
}

export function isValidModel(outputType: OutputType, modelId: string): boolean {
  return modelOptionsFor(outputType).some((m) => m.id === modelId);
}
