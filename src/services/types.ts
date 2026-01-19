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

// ==================== BC Coffee Chat Types ====================

export type BCUserType = 'applicant' | 'bc_member';

// BC Member Profile
export interface BCMemberProfile {
  id: string;
  name: string;
  photoUrl: string;
  year: string;              // Freshman, Sophomore, Junior, Senior
  major: string;             // e.g., "Business Administration", "Economics"
  semestersInBC: number;
  areasOfExpertise: string[];  // Strategy, Operations, Tech, etc.
  availability: string;        // "Weekday mornings", "Flexible", etc.
  bio: string;
  projectExperience: string;   // BC project experience
}

// Applicant Profile
export interface BCApplicantProfile {
  id: string;
  name: string;
  photoUrl: string;
  role: string;              // MBA1, Undergrad, etc.
  whyBC: string;             // "Why do you want to join BC?"
  relevantExperience: string;
  interests: string[];
}

// BC Message
export interface BCMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isFromCurrentUser: boolean;
}

// Match (coffee chat)
export interface BCMatch {
  id: string;
  applicant: BCApplicantProfile;
  bcMember: BCMemberProfile;
  matchedAt: Date;
  messages: BCMessage[];
}

// BC Areas of Expertise
export const BC_EXPERTISE_AREAS = [
  'Strategy',
  'Operations',
  'Technology',
  'Marketing',
  'Finance',
  'Healthcare',
  'Social Impact',
  'Sustainability',
  'Product Management',
  'Data Analytics',
] as const;

// BC Availability Options
export const BC_AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekends',
  'Flexible',
] as const;
