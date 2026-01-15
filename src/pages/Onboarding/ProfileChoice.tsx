import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ProfileChoiceProps {
  onUseExisting: () => void;
  onCreateNew: () => void;
}

export function ProfileChoice({ onUseExisting, onCreateNew }: ProfileChoiceProps) {
  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      {/* Header */}
      <div className="p-6 pt-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-acid-yellow flex items-center justify-center"
        >
          <Zap size={40} className="text-black" fill="black" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black text-white mb-3"
        >
          WELCOME TO TINDLER
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base text-light-gray"
        >
          How would you like to get started?
        </motion.p>
      </div>

      {/* Options */}
      <div className="flex-1 flex flex-col justify-center p-6 gap-4">
        {/* Use Existing Profile */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={onUseExisting}
            className="w-full p-6 bg-medium-gray/30 rounded-xl border-2 border-acid-yellow text-left transition-all hover:bg-medium-gray/50 active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-acid-yellow flex items-center justify-center flex-shrink-0">
                <Users size={28} className="text-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Use Existing Profile
                </h3>
                <p className="text-sm text-light-gray">
                  Already have a BMOE profile? Select it from our directory and start connecting.
                </p>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Create New Profile */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={onCreateNew}
            className="w-full p-6 bg-medium-gray/30 rounded-xl border border-medium-gray text-left transition-all hover:bg-medium-gray/50 hover:border-light-gray active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-lg bg-medium-gray flex items-center justify-center flex-shrink-0">
                <UserPlus size={28} className="text-light-gray" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Create New Profile
                </h3>
                <p className="text-sm text-light-gray">
                  New to the community? Create your profile and start meeting founders.
                </p>
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-6 pb-8 text-center"
      >
        <p className="text-xs text-medium-gray">
          By continuing, you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
