export const CATEGORIES = [
  "IPTV",
  "STREAMING",
] ;

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
] ;

export type Category = typeof CATEGORIES[number];
export type ChannelType = typeof CHANNEL_TYPES[number];
