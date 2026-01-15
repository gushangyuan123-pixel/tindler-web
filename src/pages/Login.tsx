import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';

// Google Client ID for Tindler Web (Close CRM Web credentials)
const GOOGLE_CLIENT_ID = '188625251644-v9g5d7f2g30op2mkoritdtecot69obcc.apps.googleusercontent.com';

interface LoginProps {
  onSuccess: (user: any) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function Login({ onSuccess }: LoginProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCredentialResponse = useCallback(async (response: any) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Google credential received, sending to backend...');

      // Send Google credential to backend
      const result = await apiService.loginWithGoogle(response.credential);

      console.log('Backend response:', result);

      if (result.success && result.token) {
        // Store tokens
        apiService.setTokens(result.token, result.refreshToken);
        console.log('Tokens stored, calling onSuccess...');
        onSuccess(result.user);
      } else {
        const errorMsg = result.error || 'Login failed - no token received';
        console.error('Login failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      setError(error.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  useEffect(() => {
    // Wait for Google script to load
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the Google button
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
          });
        }
      }
    };

    // Check if script is already loaded
    if (window.google) {
      initGoogle();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initGoogle();
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkGoogle);
    }
  }, [handleCredentialResponse]);

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6 safe-top">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <span className="text-6xl">&#127820;</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-black text-white mb-2 tracking-tight"
      >
        TINDLER
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm font-mono text-medium-gray mb-12 text-center"
      >
        Professional Networking
        <br />
        for BMOE Cohort
      </motion.p>

      {/* Google Sign In Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs"
      >
        <div
          id="google-signin-button"
          className="flex justify-center"
        />
      </motion.div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-6">
          <div className="w-8 h-8 border-3 border-acid-yellow border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-hot-pink text-center mt-6 px-8"
        >
          {error}
        </motion.p>
      )}

      {/* Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-medium-gray text-center mt-8 px-8"
      >
        By continuing, you agree to our
        <br />
        Terms of Service & Privacy Policy
      </motion.p>
    </div>
  );
}
