import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Input';
import { InterestList } from '../../components/InterestTag';
import { INTERESTS } from '../../services/types';

interface ProfileCreationProps {
  onComplete: (profile: ProfileData) => void;
  onBack: () => void;
}

interface ProfileData {
  name: string;
  role: string;
  company: string;
  bio: string;
  hotTake: string;
  sideProject: string;
  interests: string[];
}

export function ProfileCreation({ onComplete, onBack }: ProfileCreationProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    role: '',
    company: '',
    bio: '',
    hotTake: '',
    sideProject: '',
    interests: [],
  });

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const toggleInterest = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const canContinue = () => {
    switch (step) {
      case 0:
        return profile.name && profile.role && profile.company;
      case 1:
        return profile.bio;
      case 2:
        return profile.interests.length >= 3;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col p-6 safe-top">
      {/* Progress bar */}
      <div className="mb-8 pt-4">
        <div className="h-1 bg-medium-gray rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-acid-yellow"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs font-mono text-medium-gray mt-2">
          Step {step + 1} of {totalSteps}
        </p>
      </div>

      {/* Back button */}
      <button
        onClick={handlePrev}
        className="flex items-center gap-1 text-medium-gray hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={20} />
        <span className="text-sm">Back</span>
      </button>

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step1"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-black text-white mb-8">THE BASICS</h2>

            {/* Photo upload */}
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full bg-medium-gray flex items-center justify-center border-2 border-dashed border-light-gray">
                <Camera size={32} className="text-light-gray" />
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Name"
                placeholder="Your name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Role"
                placeholder="VP Product, Founder, etc."
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              />
              <Input
                label="Company"
                placeholder="Where you work"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-black text-white mb-8">YOUR VIBE</h2>

            <div className="space-y-6">
              <TextArea
                label="Bio"
                placeholder="What you're working on, what excites you..."
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-light-gray uppercase tracking-wider">
                    Hot Take
                  </span>
                  <span className="text-[10px] font-mono text-hot-pink uppercase px-1.5 py-0.5 bg-hot-pink/20 rounded">
                    SPICY
                  </span>
                </div>
                <Input
                  placeholder="Your controversial opinion..."
                  value={profile.hotTake}
                  onChange={(e) => setProfile({ ...profile, hotTake: e.target.value })}
                />
              </div>

              <Input
                label="Side Project"
                placeholder="What you're building on the side..."
                value={profile.sideProject}
                onChange={(e) => setProfile({ ...profile, sideProject: e.target.value })}
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-black text-white mb-2">INTERESTS</h2>
            <p className="text-sm text-medium-gray mb-8">
              Pick at least 3 to help us find your matches
            </p>

            <InterestList
              interests={[...INTERESTS]}
              selectedInterests={new Set(profile.interests)}
              onToggle={toggleInterest}
              wrap
              className="gap-3"
            />

            <p className="text-xs font-mono text-medium-gray mt-6">
              {profile.interests.length} selected
              {profile.interests.length < 3 && ` (${3 - profile.interests.length} more needed)`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button */}
      <div className="mt-auto pt-6">
        <Button
          fullWidth
          onClick={handleNext}
          disabled={!canContinue()}
          icon={<ChevronRight size={18} />}
        >
          {step === totalSteps - 1 ? 'COMPLETE' : 'CONTINUE'}
        </Button>
      </div>
    </div>
  );
}
