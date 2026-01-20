import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, AlertCircle, Lock, Mail, Loader, Coffee, Check } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import bcApiService from '../../services/bcApi';

export function BCRoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserType, userType, hasCompletedSetup, applicantMatch, isAuthenticated, isLoading, loadUserFromAPI, apiUser, logout } = useBC();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [checkingWhitelist, setCheckingWhitelist] = useState(false);

  // Check if user has a token (primary auth check)
  const hasToken = bcApiService.isAuthenticated();
  // User is logged in if they have a token OR context says authenticated
  const isLoggedIn = hasToken || isAuthenticated;

  // Check for auth errors in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setAuthError('Authentication failed. Please make sure you use your @berkeley.edu email.');
    }
  }, [searchParams]);

  // Auto-redirect to Google login if not authenticated
  useEffect(() => {
    // If no token, redirect to Google OAuth immediately
    if (!hasToken && !isLoading) {
      window.location.href = bcApiService.getGoogleLoginUrl();
      return;
    }

    // If has token but no user data, load it
    if (hasToken && !isAuthenticated && !isLoading) {
      loadUserFromAPI();
    }
  }, [hasToken, isAuthenticated, isLoading, loadUserFromAPI]);

  // Check whitelist status when logged in
  useEffect(() => {
    const checkWhitelist = async () => {
      if (isLoggedIn && isWhitelisted === null && !checkingWhitelist) {
        setCheckingWhitelist(true);
        try {
          const status = await bcApiService.checkWhitelist();
          setIsWhitelisted(status.is_whitelisted);
          // If already has profile, redirect to discover
          if (status.has_profile) {
            navigate('/bc/discover');
          }
        } catch {
          setIsWhitelisted(false);
        } finally {
          setCheckingWhitelist(false);
        }
      }
    };
    checkWhitelist();
  }, [isLoggedIn, isWhitelisted, checkingWhitelist, navigate]);

  // If already set up, redirect appropriately
  useEffect(() => {
    if (isAuthenticated && userType && hasCompletedSetup) {
      // If applicant has a match, go to match confirmation
      if (userType === 'applicant' && applicantMatch) {
        navigate('/bc/match');
      } else {
        navigate('/bc/discover');
      }
    }

    // If authenticated but not set up, go directly to setup as applicant
    if (isAuthenticated && !hasCompletedSetup) {
      setUserType('applicant');
      navigate('/bc/setup');
    }
  }, [isAuthenticated, userType, hasCompletedSetup, applicantMatch, navigate, setUserType]);

  const handleRoleSelect = (role: 'applicant' | 'bc_member') => {
    if (!isLoggedIn) {
      // Must login first - store intended role and redirect to Google OAuth
      localStorage.setItem('bc_intended_role', role);
      window.location.href = bcApiService.getGoogleLoginUrl();
      return;
    }
    setUserType(role);
    navigate('/bc/setup');
  };

  // Show loading while checking auth or redirecting to Google
  if (isLoading || !hasToken) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-medium-gray font-mono text-sm">
            {!hasToken ? 'Redirecting to Berkeley login...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-4 py-2 bg-cyan-500 text-black font-mono font-bold text-sm tracking-wider mb-4">
            BERKELEY CONSULTING
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Coffee Chat Matching</h1>
          <p className="text-medium-gray font-mono">Connect with BC members for coffee chats</p>
        </motion.div>
      </div>

      {/* Auth Error */}
      {authError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4 p-4 bg-red-500/10 border-2 border-red-500 text-red-400 font-mono text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {authError}
        </motion.div>
      )}

      {/* Welcome message for authenticated users */}
      {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-4 p-4 bg-cyan-500/10 border-2 border-cyan-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-400 font-mono text-sm">Signed in as</p>
              <p className="text-white font-bold">{apiUser?.email || 'Loading...'}</p>
            </div>
            <button
              onClick={logout}
              className="text-cyan-400 font-mono text-xs underline hover:text-cyan-300"
            >
              Sign out
            </button>
          </div>
        </motion.div>
      )}


      {/* Info text when not logged in */}
      {!isLoggedIn && (
        <div className="px-6 mb-6">
          <p className="text-center text-medium-gray font-mono text-xs">
            Select a role below to sign in with your Berkeley email
          </p>
        </div>
      )}

      {/* Role Selection */}
      <div className="flex-1 px-6 pb-8 flex flex-col justify-center gap-6">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => handleRoleSelect('applicant')}
          className="w-full bg-white text-black p-6 border-3 border-black shadow-brutalist-lg
                     hover:shadow-none hover:translate-x-1 hover:translate-y-1
                     transition-all duration-150 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cyan-500 flex items-center justify-center">
              <Users className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">I'm an Applicant</h2>
              <p className="text-medium-gray font-mono text-sm">
                Looking to join BC and connect with current members
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-light-gray">
            <ul className="space-y-2 text-sm text-medium-gray font-mono">
              <li>• Browse BC member profiles</li>
              <li>• Request coffee chats with members</li>
              <li>• Get matched for one coffee chat</li>
            </ul>
          </div>
        </motion.button>

        {/* BC Member Card - Clickable only if whitelisted */}
        {isLoggedIn && isWhitelisted ? (
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => handleRoleSelect('bc_member')}
            className="w-full bg-white text-black p-6 border-3 border-black shadow-brutalist-lg
                       hover:shadow-none hover:translate-x-1 hover:translate-y-1
                       transition-all duration-150 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-500 flex items-center justify-center">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">I'm a BC Member</h2>
                  <span className="bg-teal-500 text-white text-xs px-2 py-0.5 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <p className="text-medium-gray font-mono text-sm">
                  You're on the BC member list - set up your profile
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-light-gray">
              <ul className="space-y-2 text-sm text-medium-gray font-mono">
                <li>• Create your BC member profile</li>
                <li>• Browse applicant profiles</li>
                <li>• Match with applicants for coffee chats</li>
              </ul>
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full bg-gray-100 text-black p-6 border-3 border-gray-400 opacity-75 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-400 flex items-center justify-center">
                <Lock className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1 text-gray-600">I'm a BC Member</h2>
                <p className="text-gray-500 font-mono text-sm">
                  {checkingWhitelist ? 'Checking access...' : 'BC member accounts require admin approval'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-gray-300">
              <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded">
                <p className="text-sm text-cyan-700 font-mono flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Contact <strong>garv.agarwal.in@berkeley.edu</strong> to be added as a BC member</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-medium-gray font-mono text-xs">
          Each applicant gets one coffee chat opportunity
        </p>
      </div>
    </div>
  );
}
