// User & Profile Types
export interface UserProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  hotTake: string;
  sideProjects: string[];
  interests: string[];
  photoUrl: string;
  isVerified: boolean;
}

export interface APIProfile extends UserProfile {
  isClaimed: boolean;
  claimedByUserId?: string;
}

export interface APIUser {
  id: string;
  email: string;
  name: string;
  profileId?: string;
}

// Match & Message Types
export interface Match {
  id: string;
  matchId: number;
  profile: UserProfile;
  matchedAt: Date;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
}

export interface APIMatch {
  matchId: number;
  matchedAt: string;
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  hotTake: string;
  sideProjects: string[];
  interests: string[];
  photoUrl: string;
  isVerified: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  matchId: number;
  senderId: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
  isFromCurrentUser: boolean;
}

export interface APIMessage {
  id: string;
  matchId: number;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
  isFromCurrentUser: boolean;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: APIUser;
}

export interface ProfilesResponse {
  success: boolean;
  profiles: APIProfile[];
}

export interface MatchesResponse {
  success: boolean;
  matches: APIMatch[];
}

export interface MessagesResponse {
  success: boolean;
  messages: APIMessage[];
}

export interface LikeResponse {
  success: boolean;
  isMatch: boolean;
  matchId?: number;
}

export interface StatsResponse {
  success: boolean;
  stats: {
    likesCount: number;
    matchesCount: number;
  };
}

// App State Types
export interface AppState {
  isOnboarded: boolean;
  hasSelectedProfile: boolean;
  currentUser: UserProfile | null;
  matches: Match[];
  profiles: UserProfile[];
  showMatchPopup: boolean;
  latestMatch: UserProfile | null;
  likesCount: number;
  selectedInterests: Set<string>;
  selectedRoles: Set<string>;
}

// Constants
export const INTERESTS = [
  'AI/ML', 'Startups', 'Venture Capital', 'Product Management', 'Design',
  'Engineering', 'Marketing', 'Finance', 'Consulting', 'Healthcare',
  'Education', 'Sustainability', 'Social Impact', 'Travel', 'Music',
  'Sports', 'Gaming', 'Food & Cooking', 'Crypto/Web3', 'Art', 'Film',
  'Fitness', 'Meditation'
] as const;

export const ROLES = [
  'MBA1', 'MBA2', 'EWMBA', 'Undergrad', 'PhD', 'Alumni'
] as const;

// Helper functions
export function apiMatchToMatch(apiMatch: APIMatch): Match {
  return {
    id: apiMatch.id,
    matchId: apiMatch.matchId,
    profile: {
      id: apiMatch.id,
      name: apiMatch.name,
      role: apiMatch.role,
      company: apiMatch.company,
      bio: apiMatch.bio,
      hotTake: apiMatch.hotTake,
      sideProjects: apiMatch.sideProjects,
      interests: apiMatch.interests,
      photoUrl: apiMatch.photoUrl,
      isVerified: apiMatch.isVerified,
    },
    matchedAt: new Date(apiMatch.matchedAt),
    lastMessage: apiMatch.lastMessage,
    lastMessageAt: apiMatch.lastMessageAt ? new Date(apiMatch.lastMessageAt) : undefined,
    unreadCount: apiMatch.unreadCount,
  };
}

export function apiMessageToMessage(apiMessage: APIMessage): Message {
  return {
    id: apiMessage.id,
    matchId: apiMessage.matchId,
    senderId: apiMessage.senderId,
    content: apiMessage.content,
    createdAt: new Date(apiMessage.createdAt),
    readAt: apiMessage.readAt ? new Date(apiMessage.readAt) : undefined,
    isFromCurrentUser: apiMessage.isFromCurrentUser,
  };
}
