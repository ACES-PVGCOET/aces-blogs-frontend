import { User, Badge, Team, Blog, WriterProfile } from "./types";

/**
 * Empty sample badges
 */
export const mockSampleBadges: Badge[] = [];

/**
 * Base user profile
 */
export const mockUser: User = {
  id: "user-1",
  name: "ACES Contributor",
  email: "contributor@aces.pvgcoet.ac.in",
  school: "Department of Computer Engineering · PVGCOET",
  city: "Pune, Maharashtra",
  age: 21,
  hometown: "Pune, MH",
  companion: "contributor",
  lastAccess: "2026-01-01T00:00:00.000Z",
  rankTitle: "Author & Fellow",
  avatarUrl: null,
  bannerUrl: "/images/banner-placeholder.jpg",
  badges: [],
};

export const mockUserWithBadges: User = {
  ...mockUser,
  id: "user-2",
  badges: [],
};

/**
 * Default Writer Profile
 */
export const mockWriterProfile: WriterProfile = {
  id: "writer-101",
  name: "ACES Contributor",
  username: "contributor",
  role: "WRITER",
  status: "ACTIVE",
  profileImg: "",
  linkedIn: "",
  github: "",
  bio: "",
  labels: [],
  createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * Technical Dispatches / Blogs fallback array (empty by default; loaded dynamically from backend)
 */
export const mockBlogs: Blog[] = [];

/**
 * Campus teams rankings
 */
export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Phoenix Systems Lab",
    points: 7210,
    streakDays: 5,
    emblemVariant: "default",
    rank: 1,
  },
  {
    id: "team-2",
    name: "Turing Compilers Group",
    points: 6970,
    streakDays: 4,
    emblemVariant: "default",
    rank: 2,
  },
  {
    id: "team-3",
    name: "Consensus & Protocols Cell",
    points: 6520,
    streakDays: 3,
    emblemVariant: "default",
    rank: 3,
  },
  {
    id: "team-4",
    name: "Crypto & Zero-Knowledge Track",
    points: 5875,
    streakDays: 2,
    emblemVariant: "default",
    rank: 4,
  },
  {
    id: "team-5",
    name: "Distributed Telemetry Guild",
    points: 5800,
    streakDays: 1,
    emblemVariant: "default",
    rank: 5,
  },
  {
    id: "team-6",
    name: "Linux Kernel Hacking Unit",
    points: 5535,
    streakDays: 0,
    emblemVariant: "default",
    rank: 6,
  },
  {
    id: "team-7",
    name: "Microservices Architecture Pod",
    points: 5410,
    streakDays: 0,
    emblemVariant: "default",
    rank: 7,
  },
  {
    id: "team-8",
    name: "Wasm & Runtime Mechanics",
    points: 5180,
    streakDays: 0,
    emblemVariant: "default",
    rank: 8,
  },
];
