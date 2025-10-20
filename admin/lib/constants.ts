export const CATEGORIES = [
  "IPTV",
  "STREAMING",
] as const;

export const CHANNEL_TYPES = [
  "SPORT",
  "NEWS",
  "ACTION",
  "ENTERTAINMENT",
  "KIDS",
  "MUSIC",
  "LIFESTYLE",
  "EDUCATION",
  "OTHER",
] as const;

export type Category = typeof CATEGORIES[number];
export type ChannelType = typeof CHANNEL_TYPES[number];
