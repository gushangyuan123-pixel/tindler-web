import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Loader } from 'lucide-react';
import bcApiService from '../../services/bcApi';
import { useBC } from '../../context/BCContext';

export function BCAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUserFromAPI } = useBC();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      console.error('Auth error:', errorParam);
      navigate('/bc?error=auth_failed');
      return;
    }

    if (token) {
      // Store the token
      bcApiService.setToken(token);

      // Load user into context, then navigate based on user state
      loadUserFromAPI()
        .then(() => {
          // The context will have the user data now
          // Let BCRoleSelection handle the redirect based on state
          navigate('/bc');
        })
        .catch((err) => {
          console.error('Failed to load user:', err);
          setError('Failed to load user data');
          navigate('/bc?error=auth_failed');
        });
    } else {
      // No token, redirect to login
      navigate('/bc');
    }
  }, [searchParams, navigate, loadUserFromAPI]);

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Coffee className="w-8 h-8 text-cyan-500" />
          <span className="text-white text-xl font-bold">BC Coffee Chat</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-medium-gray">
          <Loader className="w-5 h-5 animate-spin" />
          <span className="font-mono text-sm">Signing you in...</span>
        </div>
      </div>
    </div>
  );
}
