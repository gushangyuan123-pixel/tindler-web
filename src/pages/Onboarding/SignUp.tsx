import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SignUpProps {
  onContinue: () => void;
}

export function SignUp({ onContinue }: SignUpProps) {
  return (
    <div className="min-h-screen bg-dark-gray flex flex-col p-6 safe-top">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12 pt-8"
      >
        <h1 className="text-3xl font-black text-white">WELCOME</h1>
        <p className="text-medium-gray mt-2">Let's set up your profile</p>
      </motion.div>

      {/* Info cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-8 flex-1"
      >
        <div className="bg-medium-gray/30 rounded-lg p-4">
          <h3 className="font-bold text-white mb-1">Swipe to Connect</h3>
          <p className="text-sm text-light-gray">
            Browse professional profiles and swipe right to connect
          </p>
        </div>

        <div className="bg-medium-gray/30 rounded-lg p-4">
          <h3 className="font-bold text-white mb-1">Mutual Matching</h3>
          <p className="text-sm text-light-gray">
            Only connect when both parties are interested
          </p>
        </div>

        <div className="bg-medium-gray/30 rounded-lg p-4">
          <h3 className="font-bold text-white mb-1">AI Conversation Starters</h3>
          <p className="text-sm text-light-gray">
            Get smart suggestions to break the ice
          </p>
        </div>
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          fullWidth
          size="lg"
          onClick={onContinue}
          icon={<ChevronRight size={20} />}
        >
          CREATE PROFILE
        </Button>
      </motion.div>

      {/* Terms */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-medium-gray text-center mt-6"
      >
        By continuing, you agree to our{' '}
        <span className="text-acid-yellow">Terms</span> &{' '}
        <span className="text-acid-yellow">Privacy Policy</span>
      </motion.p>
    </div>
  );
}
