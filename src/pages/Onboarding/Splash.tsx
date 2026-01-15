import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface SplashProps {
  onGetStarted: () => void;
}

export function Splash({ onGetStarted }: SplashProps) {
  return (
    <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6">
      {/* Logo card stack animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-48 h-48 mb-8"
      >
        {/* Back card (blue) */}
        <motion.div
          initial={{ rotate: -15, x: -10 }}
          animate={{ rotate: -10, x: -8 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="absolute inset-0 bg-electric-blue rounded-lg shadow-brutalist"
        />

        {/* Middle card (pink) */}
        <motion.div
          initial={{ rotate: 10, x: 10 }}
          animate={{ rotate: 5, x: 8 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute inset-0 bg-hot-pink rounded-lg shadow-brutalist"
        />

        {/* Front card (yellow) with logo */}
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute inset-0 bg-acid-yellow rounded-lg shadow-brutalist-lg flex items-center justify-center"
        >
          <Zap size={80} className="text-black" fill="black" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-5xl font-black text-white mb-2"
      >
        TINDLER
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm font-mono text-acid-yellow uppercase tracking-wider mb-12"
      >
        Networking should be fun
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-xs"
      >
        <Button fullWidth size="lg" onClick={onGetStarted}>
          GET STARTED
        </Button>
      </motion.div>

      {/* Social proof */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs text-medium-gray mt-8"
      >
        5,000+ professionals already connected
      </motion.p>
    </div>
  );
}
