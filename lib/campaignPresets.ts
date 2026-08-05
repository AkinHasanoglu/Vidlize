export type CampaignPresetId = "ramadanBayram" | "blackFriday" | "mothersDay" | "newYear" | "singlesDay";

export interface CampaignPreset {
  id: CampaignPresetId;
  /** Matches an id in lib/stockBackgrounds.ts */
  backgroundId: string;
}

export const CAMPAIGN_PRESETS: CampaignPreset[] = [
  { id: "ramadanBayram", backgroundId: "wooden-desk" },
  { id: "blackFriday", backgroundId: "white-studio" },
  { id: "mothersDay", backgroundId: "marble-counter" },
  { id: "newYear", backgroundId: "cafe-table" },
  { id: "singlesDay", backgroundId: "kitchen-counter" },
];
