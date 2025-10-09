export const CATEGORIES = [
  "Movie",
  "TV Series",
  "Anime",
  "Cartoon",
  "Live TV",
  "Streaming",
] as const;

export type Category = typeof CATEGORIES[number];
