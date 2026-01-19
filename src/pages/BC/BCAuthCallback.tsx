import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Loader } from 'lucide-react';
import bcApiService from '../../services/bcApi';

export function BCAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      navigate('/bc?error=auth_failed');
      return;
    }

    if (token) {
      // Store the token
      bcApiService.setToken(token);

      // Fetch user data and redirect appropriately
      bcApiService.getCurrentUser()
        .then((user) => {
          if (user.has_completed_setup) {
            // User already has a profile, go to discover
            navigate('/bc/discover');
          } else if (user.user_type) {
            // User selected role but hasn't completed setup
            navigate('/bc/setup');
          } else {
            // New user, go to role selection
            navigate('/bc');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user:', err);
          navigate('/bc');
        });
    } else {
      // No token, redirect to login
      navigate('/bc');
    }
  }, [searchParams, navigate]);

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
