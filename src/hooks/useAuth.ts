import { useContext } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the auth hook for convenience
export const useAuth = useAuthContext;
