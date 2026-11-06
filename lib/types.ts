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

export interface EditorialLabel {
  key: string;
  text: string;
  emoji: string;
  awarded: boolean;
  awardedBy?: string;
  awardedAt?: string;
}

export type BlogStatus =
  | "ALL"
  | "DRAFT"
  | "PUBLISHED"
  | "UNDER_REVIEW"
  | "REVISION_DRAFT"
  | "ARCHIVED"
  | "REJECT";

export interface Blog {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  author: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  reviewer?: string | null;
  status: "DRAFT" | "PUBLISHED" | "UNDER_REVIEW" | "REVISION_DRAFT" | "ARCHIVED" | "REJECT";
  category: string;
  tags: string[];
  readTime: string;
  readsCount?: number;
  content: string;
  excerpt: string;
  rejectionReason?: string | null;
  latestRevisionVersion: number;
  latestPublishedVersion: number;
  createdAt: string;
  modifiedAt: string;
}

export interface WriterProfile {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  profileImg: string;
  linkedIn?: string;
  github?: string;
  bio: string;
  labels: EditorialLabel[];
  createdAt: string;
}
