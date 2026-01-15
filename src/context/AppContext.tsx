import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { UserProfile, Match, INTERESTS, ROLES } from '../services/types';

interface AppState {
  isOnboarded: boolean;
  hasSelectedProfile: boolean;
  currentUser: UserProfile | null;
  matches: Match[];
  profiles: UserProfile[];
  showMatchPopup: boolean;
  latestMatch: UserProfile | null;
  latestMatchFull: Match | null;
  likesCount: number;
  selectedInterests: Set<string>;
  selectedRoles: Set<string>;
}

type AppAction =
  | { type: 'SET_ONBOARDED'; payload: boolean }
  | { type: 'SET_HAS_SELECTED_PROFILE'; payload: boolean }
  | { type: 'SET_CURRENT_USER'; payload: UserProfile | null }
  | { type: 'SET_MATCHES'; payload: Match[] }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'SET_PROFILES'; payload: UserProfile[] }
  | { type: 'REMOVE_PROFILE'; payload: string }
  | { type: 'SHOW_MATCH_POPUP'; payload: { profile: UserProfile; match: Match } }
  | { type: 'HIDE_MATCH_POPUP' }
  | { type: 'INCREMENT_LIKES' }
  | { type: 'SET_LIKES_COUNT'; payload: number }
  | { type: 'TOGGLE_INTEREST'; payload: string }
  | { type: 'TOGGLE_ROLE'; payload: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'UPDATE_MATCH_MESSAGE'; payload: { matchId: string; message: string } };

const initialState: AppState = {
  isOnboarded: false,
  hasSelectedProfile: false,
  currentUser: null,
  matches: [],
  profiles: [],
  showMatchPopup: false,
  latestMatch: null,
  latestMatchFull: null,
  likesCount: 0,
  selectedInterests: new Set(),
  selectedRoles: new Set(),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: action.payload };

    case 'SET_HAS_SELECTED_PROFILE':
      return { ...state, hasSelectedProfile: action.payload };

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    case 'SET_MATCHES':
      return { ...state, matches: action.payload };

    case 'ADD_MATCH':
      return { ...state, matches: [action.payload, ...state.matches] };

    case 'SET_PROFILES':
      return { ...state, profiles: action.payload };

    case 'REMOVE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.filter((p) => p.id !== action.payload),
      };

    case 'SHOW_MATCH_POPUP':
      return {
        ...state,
        showMatchPopup: true,
        latestMatch: action.payload.profile,
        latestMatchFull: action.payload.match,
      };

    case 'HIDE_MATCH_POPUP':
      return { ...state, showMatchPopup: false, latestMatch: null, latestMatchFull: null };

    case 'INCREMENT_LIKES':
      return { ...state, likesCount: state.likesCount + 1 };

    case 'SET_LIKES_COUNT':
      return { ...state, likesCount: action.payload };

    case 'TOGGLE_INTEREST': {
      const newInterests = new Set(state.selectedInterests);
      if (newInterests.has(action.payload)) {
        newInterests.delete(action.payload);
      } else {
        newInterests.add(action.payload);
      }
      return { ...state, selectedInterests: newInterests };
    }

    case 'TOGGLE_ROLE': {
      const newRoles = new Set(state.selectedRoles);
      if (newRoles.has(action.payload)) {
        newRoles.delete(action.payload);
      } else {
        newRoles.add(action.payload);
      }
      return { ...state, selectedRoles: newRoles };
    }

    case 'CLEAR_FILTERS':
      return { ...state, selectedInterests: new Set(), selectedRoles: new Set() };

    case 'UPDATE_MATCH_MESSAGE':
      return {
        ...state,
        matches: state.matches.map((m) =>
          m.id === action.payload.matchId
            ? { ...m, lastMessage: action.payload.message, lastMessageAt: new Date() }
            : m
        ),
      };

    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  chatsCount: number;
  availableInterests: readonly string[];
  availableRoles: readonly string[];
  setOnboarded: (value: boolean) => void;
  setHasSelectedProfile: (value: boolean) => void;
  setCurrentUser: (user: UserProfile | null) => void;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  setProfiles: (profiles: UserProfile[]) => void;
  removeProfile: (profileId: string) => void;
  showMatch: (profile: UserProfile, match: Match) => void;
  hideMatchPopup: () => void;
  incrementLikes: () => void;
  toggleInterest: (interest: string) => void;
  toggleRole: (role: string) => void;
  clearFilters: () => void;
  updateMatchMessage: (matchId: string, message: string) => void;
  getFilteredProfiles: () => UserProfile[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const chatsCount = state.matches.filter((m) => m.lastMessage).length;

  // Action helpers
  const setOnboarded = useCallback((value: boolean) => {
    dispatch({ type: 'SET_ONBOARDED', payload: value });
  }, []);

  const setHasSelectedProfile = useCallback((value: boolean) => {
    dispatch({ type: 'SET_HAS_SELECTED_PROFILE', payload: value });
  }, []);

  const setCurrentUser = useCallback((user: UserProfile | null) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  }, []);

  const setMatches = useCallback((matches: Match[]) => {
    dispatch({ type: 'SET_MATCHES', payload: matches });
  }, []);

  const addMatch = useCallback((match: Match) => {
    dispatch({ type: 'ADD_MATCH', payload: match });
  }, []);

  const setProfiles = useCallback((profiles: UserProfile[]) => {
    dispatch({ type: 'SET_PROFILES', payload: profiles });
  }, []);

  const removeProfile = useCallback((profileId: string) => {
    dispatch({ type: 'REMOVE_PROFILE', payload: profileId });
  }, []);

  const showMatch = useCallback((profile: UserProfile, match: Match) => {
    dispatch({ type: 'SHOW_MATCH_POPUP', payload: { profile, match } });
  }, []);

  const hideMatchPopup = useCallback(() => {
    dispatch({ type: 'HIDE_MATCH_POPUP' });
  }, []);

  const incrementLikes = useCallback(() => {
    dispatch({ type: 'INCREMENT_LIKES' });
  }, []);

  const toggleInterest = useCallback((interest: string) => {
    dispatch({ type: 'TOGGLE_INTEREST', payload: interest });
  }, []);

  const toggleRole = useCallback((role: string) => {
    dispatch({ type: 'TOGGLE_ROLE', payload: role });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const updateMatchMessage = useCallback((matchId: string, message: string) => {
    dispatch({ type: 'UPDATE_MATCH_MESSAGE', payload: { matchId, message } });
  }, []);

  const getFilteredProfiles = useCallback(() => {
    let filtered = state.profiles;

    if (state.selectedInterests.size > 0) {
      filtered = filtered.filter((p) =>
        p.interests.some((i) => state.selectedInterests.has(i))
      );
    }

    if (state.selectedRoles.size > 0) {
      filtered = filtered.filter((p) => state.selectedRoles.has(p.role));
    }

    return filtered;
  }, [state.profiles, state.selectedInterests, state.selectedRoles]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        dispatch,
        chatsCount,
        availableInterests: INTERESTS,
        availableRoles: ROLES,
        setOnboarded,
        setHasSelectedProfile,
        setCurrentUser,
        setMatches,
        addMatch,
        setProfiles,
        removeProfile,
        showMatch,
        hideMatchPopup,
        incrementLikes,
        toggleInterest,
        toggleRole,
        clearFilters,
        updateMatchMessage,
        getFilteredProfiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
