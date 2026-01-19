import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { BCUserType, BCMemberProfile, BCApplicantProfile, BCMatch, BCMessage } from '../services/types';

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
  | { type: 'ADD_MATCHED_APPLICANT_ID'; payload: string }
  | { type: 'SHOW_MATCH_POPUP'; payload: BCMatch }
  | { type: 'HIDE_MATCH_POPUP' }
  | { type: 'ADD_MESSAGE'; payload: { matchId: string; message: BCMessage } }
  | { type: 'RESET_BC_STATE' };

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
      return defaultState;

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
  addMatchedApplicantId: (id: string) => void;
  showMatch: (match: BCMatch) => void;
  hideMatchPopup: () => void;
  addMessage: (matchId: string, message: BCMessage) => void;
  resetBCState: () => void;
  getAvailableProfiles: () => (BCMemberProfile | BCApplicantProfile)[];
  isApplicant: boolean;
  isBCMember: boolean;
  hasMatch: boolean;
}

const BCContext = createContext<BCContextType | null>(null);

export function BCProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bcReducer, initialState);

  // Save state to localStorage whenever important state changes
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
        addMatchedApplicantId,
        showMatch,
        hideMatchPopup,
        addMessage,
        resetBCState,
        getAvailableProfiles,
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
