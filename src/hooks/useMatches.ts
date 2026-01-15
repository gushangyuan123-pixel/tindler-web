import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { Match, apiMatchToMatch } from '../services/types';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getMatches();
      if (response.success) {
        setMatches(response.matches.map(apiMatchToMatch));
      } else {
        setError('Failed to load matches');
      }
    } catch (err) {
      setError('An error occurred while loading matches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const newMatches = matches.filter((m) => !m.lastMessage);
  const conversations = matches.filter((m) => m.lastMessage);

  return {
    matches,
    newMatches,
    conversations,
    isLoading,
    error,
    refresh: loadMatches,
  };
}
