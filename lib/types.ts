export interface Badge {
  id: string;
  name: string;
  iconUrl: string | null;
  earnedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  school: string;
  city: string;
  age: number;
  hometown: string;
  companion: string;
  lastAccess: string; // ISO date string (e.g., "2020-05-08T15:30:00.000Z")
  rankTitle: string;
  avatarUrl: string | null;
  bannerUrl: string;
  badges: Badge[];
}

export type EmblemVariant = "default" | "decorated";

export interface Team {
  id: string;
  name: string;
  points: number;
  streakDays: number;
  emblemVariant: EmblemVariant;
  rank: number;
}
