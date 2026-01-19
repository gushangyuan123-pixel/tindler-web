import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Briefcase, LogIn, AlertCircle } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import bcApiService from '../../services/bcApi';

export function BCRoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserType, userType, hasCompletedSetup, applicantMatch } = useBC();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for auth errors in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setAuthError('Authentication failed. Please make sure you use your @berkeley.edu email.');
    }
  }, [searchParams]);

  // Check if already authenticated via API
  useEffect(() => {
    if (bcApiService.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  // If already set up, redirect appropriately
  useEffect(() => {
    if (userType && hasCompletedSetup) {
      // If applicant has a match, go to match confirmation
      if (userType === 'applicant' && applicantMatch) {
        navigate('/bc/match');
      } else {
        navigate('/bc/discover');
      }
    }
  }, [userType, hasCompletedSetup, applicantMatch, navigate]);

  const handleRoleSelect = (role: 'applicant' | 'bc_member') => {
    setUserType(role);
    navigate('/bc/setup');
  };

  const handleGoogleSignIn = () => {
    // Redirect to Django's Google OAuth login
    window.location.href = bcApiService.getGoogleLoginUrl();
  };

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

      {/* Sign in with Berkeley email option */}
      {!isAuthenticated && (
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
      {!isAuthenticated && (
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
            <div className="w-16 h-16 bg-cyan-500 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">I'm a BC Member</h2>
              <p className="text-medium-gray font-mono text-sm">
                Current BC member looking to mentor applicants
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-light-gray">
            <ul className="space-y-2 text-sm text-medium-gray font-mono">
              <li>• Review applicant profiles</li>
              <li>• Accept coffee chat requests</li>
              <li>• Manage multiple coffee chats</li>
            </ul>
          </div>
        </motion.button>
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
