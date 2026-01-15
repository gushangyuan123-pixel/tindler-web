import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Splash } from './Splash';
import { SignUp } from './SignUp';
import { ProfileCreation } from './ProfileCreation';
import { useApp } from '../../context/AppContext';

type OnboardingStep = 'splash' | 'signup' | 'profile';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('splash');
  const { setOnboarded, setCurrentUser } = useApp();

  const handleGetStarted = () => {
    setStep('signup');
  };

  const handleSignUpContinue = () => {
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
    setOnboarded(true);
    onComplete();
  };

  const handleBack = () => {
    if (step === 'profile') {
      setStep('signup');
    } else if (step === 'signup') {
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
        {step === 'signup' && (
          <SignUp onContinue={handleSignUpContinue} />
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
export { ProfileCreation } from './ProfileCreation';
