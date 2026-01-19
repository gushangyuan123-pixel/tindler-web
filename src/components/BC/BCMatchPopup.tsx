import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, MessageCircle, X } from 'lucide-react';
import { BCMatch } from '../../services/types';
import { useBC } from '../../context/BCContext';

interface BCMatchPopupProps {
  isOpen: boolean;
  match: BCMatch | null;
  onClose: () => void;
  onSendMessage: () => void;
}

export function BCMatchPopup({ isOpen, match, onClose, onSendMessage }: BCMatchPopupProps) {
  const { isApplicant } = useBC();

  if (!match) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-sm bg-white border-3 border-black shadow-brutalist-lg"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 hover:bg-light-gray rounded"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="pt-8 pb-4 px-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 bg-cyan-500 border-3 border-black mx-auto mb-4
                           flex items-center justify-center"
              >
                <Coffee className="w-8 h-8 text-black" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-1"
              >
                COFFEE CHAT
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-cyan-500"
              >
                CONFIRMED!
              </motion.p>
            </div>

            {/* Avatars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center items-center gap-4 pb-6"
            >
              <div className="relative">
                <div className="w-20 h-20 border-3 border-black overflow-hidden">
                  <img
                    src={match.applicant.photoUrl}
                    alt={match.applicant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5
                               bg-white border border-black text-[10px] font-mono whitespace-nowrap">
                  {isApplicant ? 'YOU' : 'APPLICANT'}
                </span>
              </div>

              {/* Connection dots */}
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                ))}
              </div>

              <div className="relative">
                <div className="w-20 h-20 border-3 border-black overflow-hidden">
                  <img
                    src={match.bcMember.photoUrl}
                    alt={match.bcMember.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5
                               bg-cyan-500 border border-black text-[10px] font-mono whitespace-nowrap">
                  {isApplicant ? 'BC MEMBER' : 'YOU'}
                </span>
              </div>
            </motion.div>

            {/* Match Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="px-6 pb-4 text-center"
            >
              <p className="text-medium-gray font-mono text-sm">
                {isApplicant
                  ? `You matched with ${match.bcMember.name}!`
                  : `You accepted ${match.applicant.name}'s coffee chat request!`}
              </p>
              {isApplicant && (
                <p className="text-xs text-medium-gray font-mono mt-2">
                  Availability: {match.bcMember.availability}
                </p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-4 space-y-3"
            >
              <button
                onClick={onSendMessage}
                className="w-full py-3 bg-cyan-500 text-black font-bold border-3 border-black
                           shadow-brutalist flex items-center justify-center gap-2
                           hover:shadow-none hover:translate-x-1 hover:translate-y-1
                           transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                SEND A MESSAGE
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-white text-black font-bold border-3 border-black
                           flex items-center justify-center gap-2
                           hover:bg-light-gray transition-colors"
              >
                {isApplicant ? 'VIEW YOUR MATCH' : 'KEEP REVIEWING'}
              </button>
            </motion.div>

            {/* Note for applicants */}
            {isApplicant && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="px-6 pb-4 text-center text-xs text-medium-gray font-mono"
              >
                This is your one coffee chat. Make it count!
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
