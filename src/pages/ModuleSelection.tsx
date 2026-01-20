import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coffee, Users, Lock } from 'lucide-react';

export function ModuleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6 safe-top">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <span className="text-7xl">☕</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-black text-white mb-3 tracking-tight"
      >
        ICELATTE
      </motion.h1>

      {/* Slogan */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-acid-yellow mb-4 text-center"
      >
        Break the Ice, grab a Latte.
      </motion.p>

      {/* Description */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-medium-gray mb-12 text-center max-w-xs leading-relaxed"
      >
        The most exciting networking app you've ever seen. Made by Berkeley undergrads here on campus. Coming soon, stay tuned.
      </motion.p>

      {/* Module Selection */}
      <div className="w-full max-w-sm space-y-4">
        {/* IceLatte Networking - Coming Soon */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative"
        >
          <div className="bg-zinc-800/50 border-2 border-zinc-700 rounded-2xl p-6 opacity-60 cursor-not-allowed">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-zinc-700 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-zinc-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-400">IceLatte Networking</h3>
                  <Lock className="w-4 h-4 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-500 mt-1">Coming Soon...</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* IceLatte X Berkeley Consulting - Active */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/bc')}
          className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 border-2 border-cyan-400 rounded-2xl p-6 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">IceLatte X Berkeley Consulting</h3>
              <p className="text-sm text-cyan-100 mt-1">Connect with BC members for coffee chats</p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-medium-gray text-center mt-12"
      >
        Made with ☕ at UC Berkeley
      </motion.p>
    </div>
  );
}
