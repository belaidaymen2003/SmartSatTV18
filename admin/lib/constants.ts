export const CATEGORIES = [
  "IPTV",
  "STREAMING",
] as const;

export type Category = typeof CATEGORIES[number];
