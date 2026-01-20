import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Loader } from 'lucide-react';
import bcApiService from '../../services/bcApi';
import { useBC } from '../../context/BCContext';

export function BCAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUserFromAPI, setUserType } = useBC();
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

      // Load user into context, then check whitelist and navigate
      loadUserFromAPI()
        .then(async () => {
          // Check if there was an intended role before login
          const intendedRole = localStorage.getItem('bc_intended_role');
          const inviteCode = localStorage.getItem('bc_invite_code');

          // Clear stored values
          localStorage.removeItem('bc_intended_role');
          localStorage.removeItem('bc_invite_code');

          // Check whitelist status
          try {
            const whitelistStatus = await bcApiService.checkWhitelist();

            // If user is whitelisted BC member without profile, go to setup
            if (whitelistStatus.is_whitelisted && !whitelistStatus.has_profile) {
              setUserType('bc_member');
              navigate('/bc/setup');
              return;
            }

            // If user already has BC member profile, go to discover
            if (whitelistStatus.has_profile) {
              navigate('/bc/discover');
              return;
            }
          } catch (err) {
            console.log('Whitelist check failed, continuing with normal flow');
          }

          // BC member with invite code - redirect back to join page
          if (intendedRole === 'bc_member' && inviteCode) {
            navigate(`/bc/join?code=${inviteCode}`);
          } else if (intendedRole === 'applicant') {
            setUserType('applicant');
            navigate('/bc/setup');
          } else {
            // No intended role, go to role selection
            navigate('/bc');
          }
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
  }, [searchParams, navigate, loadUserFromAPI, setUserType]);

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
