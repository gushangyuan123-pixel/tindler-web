import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect, useState } from 'react';
import { BCUserType, BCMemberProfile, BCApplicantProfile, BCMatch, BCMessage } from '../services/types';
import bcApiService from '../services/bcApi';

const STORAGE_KEY = 'tindler_bc_state';

interface BCState {
  userType: BCUserType | null;
  hasCompletedSetup: boolean;
  currentProfile: BCMemberProfile | BCApplicantProfile | null;

  // Profiles to swipe on
  profiles: (BCMemberProfile | BCApplicantProfile)[];

  // Applicant: single match or null
  // BC Member: array of matches
  applicantMatch: BCMatch | null;
  memberMatches: BCMatch[];

  // Swipe tracking
  likedIds: string[];
  passedIds: string[];

  // Track which applicants have been matched (for removing from pool)
  matchedApplicantIds: string[];

  // UI state
  showMatchPopup: boolean;
  latestMatch: BCMatch | null;

  // API state
  isAuthenticated: boolean;
  isLoading: boolean;
  apiUser: any | null;  // Raw user data from API
}

// Load state from localStorage
function loadState(): Partial<BCState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        userType: parsed.userType ?? null,
        hasCompletedSetup: parsed.hasCompletedSetup ?? false,
        currentProfile: parsed.currentProfile ?? null,
        applicantMatch: parsed.applicantMatch ? {
          ...parsed.applicantMatch,
          matchedAt: new Date(parsed.applicantMatch.matchedAt),
          messages: (parsed.applicantMatch.messages ?? []).map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })),
        } : null,
        memberMatches: (parsed.memberMatches ?? []).map((match: any) => ({
          ...match,
          matchedAt: new Date(match.matchedAt),
          messages: (match.messages ?? []).map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          })),
        })),
        likedIds: parsed.likedIds ?? [],
        passedIds: parsed.passedIds ?? [],
        matchedApplicantIds: parsed.matchedApplicantIds ?? [],
      };
    }
  } catch (e) {
    console.error('Failed to load BC state:', e);
  }
  return {};
}

// Save state to localStorage
function saveState(state: BCState) {
  try {
    const toSave = {
      userType: state.userType,
      hasCompletedSetup: state.hasCompletedSetup,
      currentProfile: state.currentProfile,
      applicantMatch: state.applicantMatch,
      memberMatches: state.memberMatches,
      likedIds: state.likedIds,
      passedIds: state.passedIds,
      matchedApplicantIds: state.matchedApplicantIds,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save BC state:', e);
  }
}

type BCAction =
  | { type: 'SET_USER_TYPE'; payload: BCUserType }
  | { type: 'SET_COMPLETED_SETUP'; payload: boolean }
  | { type: 'SET_CURRENT_PROFILE'; payload: BCMemberProfile | BCApplicantProfile }
  | { type: 'SET_PROFILES'; payload: (BCMemberProfile | BCApplicantProfile)[] }
  | { type: 'REMOVE_PROFILE'; payload: string }
  | { type: 'ADD_LIKED_ID'; payload: string }
  | { type: 'ADD_PASSED_ID'; payload: string }
  | { type: 'SET_APPLICANT_MATCH'; payload: BCMatch }
  | { type: 'ADD_MEMBER_MATCH'; payload: BCMatch }
  | { type: 'SET_MEMBER_MATCHES'; payload: BCMatch[] }
  | { type: 'SET_MATCH_MESSAGES'; payload: { matchId: string; messages: BCMessage[] } }
  | { type: 'ADD_MATCHED_APPLICANT_ID'; payload: string }
  | { type: 'SHOW_MATCH_POPUP'; payload: BCMatch }
  | { type: 'HIDE_MATCH_POPUP' }
  | { type: 'ADD_MESSAGE'; payload: { matchId: string; message: BCMessage } }
  | { type: 'RESET_BC_STATE' }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_API_USER'; payload: any }
  | { type: 'LOAD_FROM_API'; payload: { userType: BCUserType | null; hasCompletedSetup: boolean; profile: any | null; apiUser: any } };

const defaultState: BCState = {
  userType: null,
  hasCompletedSetup: false,
  currentProfile: null,
  profiles: [],
  applicantMatch: null,
  memberMatches: [],
  likedIds: [],
  passedIds: [],
  matchedApplicantIds: [],
  showMatchPopup: false,
  latestMatch: null,
  isAuthenticated: false,
  isLoading: false,
  apiUser: null,
};

// Merge saved state with defaults
const savedState = loadState();
const initialState: BCState = {
  ...defaultState,
  ...savedState,
};

function bcReducer(state: BCState, action: BCAction): BCState {
  switch (action.type) {
    case 'SET_USER_TYPE':
      return { ...state, userType: action.payload };

    case 'SET_COMPLETED_SETUP':
      return { ...state, hasCompletedSetup: action.payload };

    case 'SET_CURRENT_PROFILE':
      return { ...state, currentProfile: action.payload };

    case 'SET_PROFILES':
      return { ...state, profiles: action.payload };

    case 'REMOVE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.filter((p) => p.id !== action.payload),
      };

    case 'ADD_LIKED_ID':
      return {
        ...state,
        likedIds: [...state.likedIds, action.payload],
      };

    case 'ADD_PASSED_ID':
      return {
        ...state,
        passedIds: [...state.passedIds, action.payload],
      };

    case 'SET_APPLICANT_MATCH':
      return { ...state, applicantMatch: action.payload };

    case 'ADD_MEMBER_MATCH':
      return {
        ...state,
        memberMatches: [action.payload, ...state.memberMatches],
      };

    case 'SET_MEMBER_MATCHES':
      return {
        ...state,
        memberMatches: action.payload,
      };

    case 'SET_MATCH_MESSAGES': {
      const { matchId, messages } = action.payload;

      // Update applicant match messages
      if (state.applicantMatch && state.applicantMatch.id === matchId) {
        return {
          ...state,
          applicantMatch: {
            ...state.applicantMatch,
            messages,
          },
        };
      }

      // Update member matches messages
      return {
        ...state,
        memberMatches: state.memberMatches.map((m) =>
          m.id === matchId ? { ...m, messages } : m
        ),
      };
    }

    case 'ADD_MATCHED_APPLICANT_ID':
      return {
        ...state,
        matchedApplicantIds: [...state.matchedApplicantIds, action.payload],
      };

    case 'SHOW_MATCH_POPUP':
      return {
        ...state,
        showMatchPopup: true,
        latestMatch: action.payload,
      };

    case 'HIDE_MATCH_POPUP':
      return { ...state, showMatchPopup: false };

    case 'ADD_MESSAGE': {
      const { matchId, message } = action.payload;

      // Update applicant match messages
      if (state.applicantMatch && state.applicantMatch.id === matchId) {
        return {
          ...state,
          applicantMatch: {
            ...state.applicantMatch,
            messages: [...state.applicantMatch.messages, message],
          },
        };
      }

      // Update member matches messages
      return {
        ...state,
        memberMatches: state.memberMatches.map((m) =>
          m.id === matchId
            ? { ...m, messages: [...m.messages, message] }
            : m
        ),
      };
    }

    case 'RESET_BC_STATE':
      return { ...defaultState, isAuthenticated: state.isAuthenticated, apiUser: null };

    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_API_USER':
      return { ...state, apiUser: action.payload };

    case 'LOAD_FROM_API': {
      const { userType, hasCompletedSetup, profile, apiUser } = action.payload;
      return {
        ...state,
        userType,
        hasCompletedSetup,
        currentProfile: profile,
        apiUser,
        isAuthenticated: true,
        isLoading: false,
      };
    }

    default:
      return state;
  }
}

interface BCContextType extends BCState {
  dispatch: React.Dispatch<BCAction>;
  setUserType: (type: BCUserType) => void;
  setCompletedSetup: (completed: boolean) => void;
  setCurrentProfile: (profile: BCMemberProfile | BCApplicantProfile) => void;
  setProfiles: (profiles: (BCMemberProfile | BCApplicantProfile)[]) => void;
  removeProfile: (profileId: string) => void;
  addLikedId: (id: string) => void;
  addPassedId: (id: string) => void;
  setApplicantMatch: (match: BCMatch) => void;
  addMemberMatch: (match: BCMatch) => void;
  setMemberMatches: (matches: BCMatch[]) => void;
  setMatchMessages: (matchId: string, messages: BCMessage[]) => void;
  addMatchedApplicantId: (id: string) => void;
  showMatch: (match: BCMatch) => void;
  hideMatchPopup: () => void;
  addMessage: (matchId: string, message: BCMessage) => void;
  resetBCState: () => void;
  getAvailableProfiles: () => (BCMemberProfile | BCApplicantProfile)[];
  loadUserFromAPI: () => Promise<void>;
  loadMatchesFromAPI: () => Promise<void>;
  loadMessagesFromAPI: (matchId: string) => Promise<void>;
  logout: () => Promise<void>;
  isApplicant: boolean;
  isBCMember: boolean;
  hasMatch: boolean;
}

const BCContext = createContext<BCContextType | null>(null);

export function BCProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bcReducer, initialState);

  // Convert API message to frontend format
  const convertAPIMessage = (msg: any, currentUserId: string): BCMessage => ({
    id: String(msg.id),
    matchId: String(msg.match),
    senderId: String(msg.sender),
    content: msg.content,
    createdAt: new Date(msg.created_at),
    isFromCurrentUser: String(msg.sender) === currentUserId,
  });

  // Convert API match to frontend format
  const convertAPIMatch = (match: any, userType: BCUserType): BCMatch => {
    const applicantProfile: BCApplicantProfile = {
      id: String(match.applicant?.user?.id || match.applicant?.id),
      name: match.applicant?.user?.name || '',
      photoUrl: match.applicant?.user?.photo_url || '/profiles/default.jpg',
      role: match.applicant?.role || '',
      whyBC: match.applicant?.why_bc || '',
      relevantExperience: match.applicant?.relevant_experience || '',
      interests: match.applicant?.interests || [],
    };

    const memberProfile: BCMemberProfile = {
      id: String(match.bc_member?.user?.id || match.bc_member?.id),
      name: match.bc_member?.user?.name || '',
      photoUrl: match.bc_member?.user?.photo_url || '/profiles/default.jpg',
      year: match.bc_member?.year || '',
      major: match.bc_member?.major || '',
      semestersInBC: match.bc_member?.semesters_in_bc || 1,
      areasOfExpertise: match.bc_member?.areas_of_expertise || [],
      availability: match.bc_member?.availability || '',
      bio: match.bc_member?.bio || '',
      projectExperience: match.bc_member?.project_experience || '',
    };

    return {
      id: String(match.id),
      applicant: applicantProfile,
      bcMember: memberProfile,
      matchedAt: new Date(match.matched_at || match.created_at),
      messages: [],
      status: match.status, // 'pending', 'confirmed', 'completed', 'rejected'
    };
  };

  // Convert API profile to frontend format
  const convertAPIProfile = (profile: any, userType: BCUserType): BCMemberProfile | BCApplicantProfile | null => {
    if (!profile) return null;

    if (userType === 'bc_member') {
      return {
        id: String(profile.id),
        name: profile.user?.name || '',
        photoUrl: profile.user?.photo_url || '/profiles/default.jpg',
        year: profile.year,
        major: profile.major,
        semestersInBC: profile.semesters_in_bc,
        areasOfExpertise: profile.areas_of_expertise || [],
        availability: profile.availability,
        bio: profile.bio,
        projectExperience: profile.project_experience,
      };
    } else {
      return {
        id: String(profile.id),
        name: profile.user?.name || '',
        photoUrl: profile.user?.photo_url || '/profiles/default.jpg',
        role: profile.role,
        whyBC: profile.why_bc,
        relevantExperience: profile.relevant_experience,
        interests: profile.interests || [],
      };
    }
  };

  // Load user data from API
  const loadUserFromAPI = useCallback(async () => {
    if (!bcApiService.isAuthenticated()) {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const userData = await bcApiService.getCurrentUser();
      const userType = userData.user_type as BCUserType | null;
      const profile = userData.profile ? convertAPIProfile(userData.profile, userType!) : null;

      dispatch({
        type: 'LOAD_FROM_API',
        payload: {
          userType,
          hasCompletedSetup: userData.has_completed_setup,
          profile,
          apiUser: userData,
        },
      });
    } catch (error) {
      console.error('Failed to load user from API:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      // Clear invalid token
      bcApiService.clearToken();
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    }
  }, []);

  // Load matches from API
  const loadMatchesFromAPI = useCallback(async () => {
    if (!bcApiService.isAuthenticated() || !state.userType) {
      return;
    }

    try {
      const response = await bcApiService.getMatches();
      const matches = (response.results || response || []).map((m: any) =>
        convertAPIMatch(m, state.userType!)
      );

      if (state.userType === 'applicant') {
        // Applicants can only have one match
        if (matches.length > 0) {
          dispatch({ type: 'SET_APPLICANT_MATCH', payload: matches[0] });
        }
      } else {
        dispatch({ type: 'SET_MEMBER_MATCHES', payload: matches });
      }
    } catch (error) {
      console.error('Failed to load matches from API:', error);
    }
  }, [state.userType]);

  // Load messages for a specific match from API
  const loadMessagesFromAPI = useCallback(async (matchId: string) => {
    if (!bcApiService.isAuthenticated()) {
      return;
    }

    try {
      const response = await bcApiService.getMessages(parseInt(matchId));
      const messagesData = response.results || response || [];
      const currentUserId = state.apiUser?.id ? String(state.apiUser.id) : '';
      const messages = messagesData.map((m: any) => convertAPIMessage(m, currentUserId));

      dispatch({ type: 'SET_MATCH_MESSAGES', payload: { matchId, messages } });
    } catch (error) {
      console.error('Failed to load messages from API:', error);
    }
  }, [state.apiUser]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await bcApiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    bcApiService.clearToken();
    dispatch({ type: 'RESET_BC_STATE' });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (bcApiService.isAuthenticated()) {
      loadUserFromAPI();
    }
  }, [loadUserFromAPI]);

  // Load matches when user is authenticated and has completed setup
  useEffect(() => {
    if (state.isAuthenticated && state.hasCompletedSetup && state.userType) {
      loadMatchesFromAPI();
    }
  }, [state.isAuthenticated, state.hasCompletedSetup, state.userType, loadMatchesFromAPI]);

  // Save state to localStorage whenever important state changes (for demo mode / offline)
  useEffect(() => {
    saveState(state);
  }, [
    state.userType,
    state.hasCompletedSetup,
    state.currentProfile,
    state.applicantMatch,
    state.memberMatches,
    state.likedIds,
    state.passedIds,
    state.matchedApplicantIds,
  ]);

  // Action helpers
  const setUserType = useCallback((type: BCUserType) => {
    dispatch({ type: 'SET_USER_TYPE', payload: type });
  }, []);

  const setCompletedSetup = useCallback((completed: boolean) => {
    dispatch({ type: 'SET_COMPLETED_SETUP', payload: completed });
  }, []);

  const setCurrentProfile = useCallback((profile: BCMemberProfile | BCApplicantProfile) => {
    dispatch({ type: 'SET_CURRENT_PROFILE', payload: profile });
  }, []);

  const setProfiles = useCallback((profiles: (BCMemberProfile | BCApplicantProfile)[]) => {
    dispatch({ type: 'SET_PROFILES', payload: profiles });
  }, []);

  const removeProfile = useCallback((profileId: string) => {
    dispatch({ type: 'REMOVE_PROFILE', payload: profileId });
  }, []);

  const addLikedId = useCallback((id: string) => {
    dispatch({ type: 'ADD_LIKED_ID', payload: id });
  }, []);

  const addPassedId = useCallback((id: string) => {
    dispatch({ type: 'ADD_PASSED_ID', payload: id });
  }, []);

  const setApplicantMatch = useCallback((match: BCMatch) => {
    dispatch({ type: 'SET_APPLICANT_MATCH', payload: match });
  }, []);

  const addMemberMatch = useCallback((match: BCMatch) => {
    dispatch({ type: 'ADD_MEMBER_MATCH', payload: match });
  }, []);

  const setMemberMatches = useCallback((matches: BCMatch[]) => {
    dispatch({ type: 'SET_MEMBER_MATCHES', payload: matches });
  }, []);

  const setMatchMessages = useCallback((matchId: string, messages: BCMessage[]) => {
    dispatch({ type: 'SET_MATCH_MESSAGES', payload: { matchId, messages } });
  }, []);

  const addMatchedApplicantId = useCallback((id: string) => {
    dispatch({ type: 'ADD_MATCHED_APPLICANT_ID', payload: id });
  }, []);

  const showMatch = useCallback((match: BCMatch) => {
    dispatch({ type: 'SHOW_MATCH_POPUP', payload: match });
  }, []);

  const hideMatchPopup = useCallback(() => {
    dispatch({ type: 'HIDE_MATCH_POPUP' });
  }, []);

  const addMessage = useCallback((matchId: string, message: BCMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { matchId, message } });
  }, []);

  const resetBCState = useCallback(() => {
    dispatch({ type: 'RESET_BC_STATE' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get profiles that haven't been liked/passed and (for BC members) aren't already matched
  const getAvailableProfiles = useCallback(() => {
    let available = state.profiles.filter(
      (p) => !state.likedIds.includes(p.id) && !state.passedIds.includes(p.id)
    );

    // For BC members, also filter out applicants who have already been matched
    if (state.userType === 'bc_member') {
      available = available.filter(
        (p) => !state.matchedApplicantIds.includes(p.id)
      );
    }

    return available;
  }, [state.profiles, state.likedIds, state.passedIds, state.userType, state.matchedApplicantIds]);

  // Computed values
  const isApplicant = state.userType === 'applicant';
  const isBCMember = state.userType === 'bc_member';
  const hasMatch = isApplicant ? state.applicantMatch !== null : state.memberMatches.length > 0;

  return (
    <BCContext.Provider
      value={{
        ...state,
        dispatch,
        setUserType,
        setCompletedSetup,
        setCurrentProfile,
        setProfiles,
        removeProfile,
        addLikedId,
        addPassedId,
        setApplicantMatch,
        addMemberMatch,
        setMemberMatches,
        setMatchMessages,
        addMatchedApplicantId,
        showMatch,
        hideMatchPopup,
        addMessage,
        resetBCState,
        getAvailableProfiles,
        loadUserFromAPI,
        loadMatchesFromAPI,
        loadMessagesFromAPI,
        logout,
        isApplicant,
        isBCMember,
        hasMatch,
      }}
    >
      {children}
    </BCContext.Provider>
  );
}

export function useBC() {
  const context = useContext(BCContext);
  if (!context) {
    throw new Error('useBC must be used within a BCProvider');
  }
  return context;
}
