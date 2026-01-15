import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Send, X } from 'lucide-react';
import { UserProfile } from '../services/types';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { generateAIStarter } from '../utils/aiStarters';

interface MatchPopupProps {
  isOpen: boolean;
  matchedProfile: UserProfile | null;
  currentUserName?: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
  onClose: () => void;
}

export function MatchPopup({
  isOpen,
  matchedProfile,
  currentUserName = 'YOU',
  onSendMessage,
  onKeepSwiping,
  onClose,
}: MatchPopupProps) {
  const [aiStarter, setAiStarter] = useState('');

  useEffect(() => {
    if (matchedProfile) {
      setAiStarter(generateAIStarter(matchedProfile));
    }
  }, [matchedProfile]);

  if (!matchedProfile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 text-light-gray hover:text-white"
            >
              <X size={24} />
            </button>

            {/* Match icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-acid-yellow flex items-center justify-center">
                <Zap size={40} className="text-black" fill="black" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-center mb-6"
            >
              <h2 className="text-4xl font-black text-acid-yellow mb-2">
                IT'S A MATCH!
              </h2>
              <p className="text-base text-light-gray">
                You and {matchedProfile.name} want to connect
              </p>
            </motion.div>

            {/* Profile preview */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-6 mb-6"
            >
              {/* Current user */}
              <div className="flex flex-col items-center gap-2">
                <Avatar size="lg" />
                <span className="text-xs font-mono text-light-gray uppercase">
                  {currentUserName}
                </span>
              </div>

              {/* Connection indicator */}
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-acid-yellow" />
                <div className="w-2 h-2 rounded-full bg-acid-yellow" />
                <div className="w-2 h-2 rounded-full bg-acid-yellow" />
              </div>

              {/* Matched profile */}
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  src={matchedProfile.photoUrl}
                  alt={matchedProfile.name}
                  size="lg"
                />
                <span className="text-xs font-mono text-light-gray uppercase truncate max-w-[80px]">
                  {matchedProfile.name.split(' ')[0]}
                </span>
              </div>
            </motion.div>

            {/* AI conversation starter */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-acid-yellow" />
                <span className="text-[11px] font-mono text-acid-yellow uppercase tracking-wider">
                  AI Conversation Starter
                </span>
              </div>
              <div className="bg-dark-gray border border-acid-yellow rounded-lg p-4">
                <p className="text-base text-white">{aiStarter}</p>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <Button
                fullWidth
                onClick={onSendMessage}
                icon={<Send size={18} />}
              >
                SEND MESSAGE
              </Button>
              <Button
                fullWidth
                variant="outline"
                onClick={onKeepSwiping}
              >
                KEEP SWIPING
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
