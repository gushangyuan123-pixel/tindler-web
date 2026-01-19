import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Briefcase, LogIn, AlertCircle, Lock, Mail, Loader } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import bcApiService from '../../services/bcApi';

export function BCRoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserType, userType, hasCompletedSetup, applicantMatch, isAuthenticated, isLoading, loadUserFromAPI, apiUser, logout } = useBC();
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Load user data if authenticated but no user data yet
  useEffect(() => {
    if (bcApiService.isAuthenticated() && !isAuthenticated && !isLoading) {
      loadUserFromAPI();
    }
  }, [isAuthenticated, isLoading, loadUserFromAPI]);

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
  }, [isAuthenticated, userType, hasCompletedSetup, applicantMatch, navigate]);

  const handleRoleSelect = (role: 'applicant' | 'bc_member') => {
    setUserType(role);
    navigate('/bc/setup');
  };

  const handleGoogleSignIn = () => {
    // Redirect to Django's Google OAuth login
    window.location.href = bcApiService.getGoogleLoginUrl();
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-medium-gray font-mono text-sm">Loading...</p>
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

      {/* Sign in with Berkeley email option */}
      {!isLoggedIn && (
        <div className="px-6 mb-6">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-black p-4 border-3 border-black shadow-brutalist
                       hover:shadow-none hover:translate-x-1 hover:translate-y-1
                       transition-all duration-150 flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            <span className="font-bold">Sign in with Berkeley Email</span>
          </motion.button>
          <p className="text-center text-medium-gray font-mono text-xs mt-2">
            Use your @berkeley.edu email to save your profile
          </p>
        </div>
      )}

      {/* Divider */}
      {!isLoggedIn && (
        <div className="px-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-medium-gray/30" />
            <span className="text-medium-gray font-mono text-xs">OR TRY DEMO MODE</span>
            <div className="flex-1 h-px bg-medium-gray/30" />
          </div>
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

        {/* BC Member Card - Not clickable, admin-only */}
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
                BC member accounts are created by admins only
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
