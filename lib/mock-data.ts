import { User, Badge, Team } from "./types";

/**
 * Sample earned badges to test the filled state.
 */
export const mockSampleBadges: Badge[] = [
  {
    id: "badge-1",
    name: "Primeira Vitória",
    iconUrl: null,
    earnedAt: "2020-04-12T10:00:00.000Z",
  },
  {
    id: "badge-2",
    name: "Explorador da Floresta",
    iconUrl: null,
    earnedAt: "2020-05-01T14:20:00.000Z",
  },
];

/**
 * Primary user profile mock.
 * Note: Uses neutral placeholder name "Ana Clara Mendes" as specified.
 * Easy to update or swap with Finn Campbell Mertens if needed.
 */
export const mockUser: User = {
  id: "user-1",
  name: "Ana Clara Mendes",
  email: "ana.mendes@escola.sp.gov.br",
  school: "E.E. Cecília Meireles",
  city: "São Paulo, SP",
  age: 16,
  hometown: "Campinas, SP",
  companion: "Pipoca (Golden)",
  lastAccess: "2020-05-08T18:45:00.000Z",
  rankTitle: "Aventureiro",
  avatarUrl: "/images/avatar-placeholder.png",
  bannerUrl: "/images/banner-placeholder.jpg",
  badges: [], // Default is empty to show the empty state
};

/**
 * Alternative mock user with badges filled for demonstration/testing.
 */
export const mockUserWithBadges: User = {
  ...mockUser,
  id: "user-2",
  badges: mockSampleBadges,
};

/**
 * Eight teams sorted by rank.
 * Ranks 1 to 3 appear on the podium.
 * Ranks 4 to 8 appear on the ordered ranking list.
 */
export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "Equipe Um",
    points: 7210,
    streakDays: 5,
    emblemVariant: "default",
    rank: 1,
  },
  {
    id: "team-2",
    name: "Equipe Dois",
    points: 6970,
    streakDays: 2,
    emblemVariant: "default",
    rank: 2,
  },
  {
    id: "team-3",
    name: "Equipe Três",
    points: 6520,
    streakDays: 1,
    emblemVariant: "decorated",
    rank: 3,
  },
  {
    id: "team-4",
    name: "Equipe Quatro",
    points: 5875,
    streakDays: 0,
    emblemVariant: "default",
    rank: 4,
  },
  {
    id: "team-5",
    name: "Equipe Cinco",
    points: 5800,
    streakDays: 0,
    emblemVariant: "default",
    rank: 5,
  },
  {
    id: "team-6",
    name: "Equipe Seis",
    points: 5535,
    streakDays: 0,
    emblemVariant: "default",
    rank: 6,
  },
  {
    id: "team-7",
    name: "Equipe Sete",
    points: 5535,
    streakDays: 0,
    emblemVariant: "default",
    rank: 7,
  },
  {
    id: "team-8",
    name: "Equipe Oito",
    points: 5180,
    streakDays: 0,
    emblemVariant: "default",
    rank: 8,
  },
];
