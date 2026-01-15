import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Splash } from './Splash';
import { ProfileChoice } from './ProfileChoice';
import { ProfileCreation } from './ProfileCreation';
import { useApp } from '../../context/AppContext';

type OnboardingStep = 'splash' | 'choice' | 'profile';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('splash');
  const { setOnboarded, setHasSelectedProfile, setCurrentUser } = useApp();

  const handleGetStarted = () => {
    setStep('choice');
  };

  const handleUseExisting = () => {
    // User wants to select from existing profiles
    // Set onboarded=true so they go to ProfileSelection
    // hasSelectedProfile stays false so they see the selection screen
    setOnboarded(true);
    onComplete();
  };

  const handleCreateNew = () => {
    // User wants to create a new profile
    setStep('profile');
  };

  const handleProfileComplete = (profileData: any) => {
    // Create user profile from form data
    const userProfile = {
      id: 'local-user',
      name: profileData.name,
      role: profileData.role,
      company: profileData.company,
      bio: profileData.bio,
      hotTake: profileData.hotTake,
      sideProjects: profileData.sideProject ? [profileData.sideProject] : [],
      interests: profileData.interests,
      photoUrl: '',
      isVerified: true,
    };

    setCurrentUser(userProfile);
    // Set BOTH flags so user skips ProfileSelection and goes straight to Discover
    setOnboarded(true);
    setHasSelectedProfile(true);
    onComplete();
  };

  const handleBack = () => {
    if (step === 'profile') {
      setStep('choice');
    } else if (step === 'choice') {
      setStep('splash');
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {step === 'splash' && <Splash onGetStarted={handleGetStarted} />}
        {step === 'choice' && (
          <ProfileChoice
            onUseExisting={handleUseExisting}
            onCreateNew={handleCreateNew}
          />
        )}
        {step === 'profile' && (
          <ProfileCreation
            onComplete={handleProfileComplete}
            onBack={handleBack}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export { Splash } from './Splash';
export { SignUp } from './SignUp';
export { ProfileChoice } from './ProfileChoice';
export { ProfileCreation } from './ProfileCreation';
