export const FORUM_TAGS = [
  "Beginners",
  "Advanced",
  "Surf Spots",
  "Gear Talk",
  "Safety",
  "Weather",
  "Events",
  "Technique",
  "Local Tips",
  "Meet Ups",
] as const

export type ForumTag = (typeof FORUM_TAGS)[number]

