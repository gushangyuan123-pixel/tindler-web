import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Coffee, RefreshCw } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import { BCHeader } from '../../components/BC/BCHeader';
import { BCProfileCard } from '../../components/BC/BCProfileCard';
import { BCMatchPopup } from '../../components/BC/BCMatchPopup';
import { useSwipe } from '../../hooks/useSwipe';
import { BCMatch, BCMemberProfile, BCApplicantProfile } from '../../services/types';
import { mockBCMembers, mockBCApplicants, shuffleBCProfiles } from '../../data/mockBCProfiles';

export function BCDiscover() {
  const navigate = useNavigate();
  const {
    userType,
    hasCompletedSetup,
    currentProfile,
    applicantMatch,
    isApplicant,
    isBCMember: isMemberUser,
    getAvailableProfiles,
    addLikedId,
    addPassedId,
    removeProfile,
    setApplicantMatch,
    addMemberMatch,
    addMatchedApplicantId,
    showMatch,
    hideMatchPopup,
    showMatchPopup,
    latestMatch,
    likedIds,
    setProfiles,
  } = useBC();

  const availableProfiles = getAvailableProfiles();
  const topProfile = availableProfiles[0];

  // Redirect if not set up or if applicant already has a match
  useEffect(() => {
    if (!userType || !hasCompletedSetup) {
      navigate('/bc');
      return;
    }
    if (isApplicant && applicantMatch) {
      navigate('/bc/match');
    }
  }, [userType, hasCompletedSetup, isApplicant, applicantMatch, navigate]);

  // Simulate matching logic (in real app, this would check backend)
  const checkForMatch = useCallback((profileId: string): boolean => {
    // Simulate 40% match rate for demo purposes
    return Math.random() < 0.4;
  }, []);

  const handleSwipeRight = useCallback(() => {
    if (!topProfile || !currentProfile) return;

    addLikedId(topProfile.id);
    removeProfile(topProfile.id);

    // Check for match
    const isMatch = checkForMatch(topProfile.id);

    if (isMatch) {
      const match: BCMatch = {
        id: `match-${Date.now()}`,
        applicant: isApplicant
          ? (currentProfile as BCApplicantProfile)
          : (topProfile as BCApplicantProfile),
        bcMember: isApplicant
          ? (topProfile as BCMemberProfile)
          : (currentProfile as BCMemberProfile),
        matchedAt: new Date(),
        messages: [],
      };

      if (isApplicant) {
        setApplicantMatch(match);
      } else {
        addMemberMatch(match);
        addMatchedApplicantId(topProfile.id);
      }

      showMatch(match);
    }
  }, [
    topProfile,
    currentProfile,
    isApplicant,
    addLikedId,
    removeProfile,
    checkForMatch,
    setApplicantMatch,
    addMemberMatch,
    addMatchedApplicantId,
    showMatch,
  ]);

  const handleSwipeLeft = useCallback(() => {
    if (!topProfile) return;
    addPassedId(topProfile.id);
    removeProfile(topProfile.id);
  }, [topProfile, addPassedId, removeProfile]);

  const { state: swipeState, handlers, swipeLeft, swipeRight } = useSwipe({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const handleMatchPopupClose = () => {
    hideMatchPopup();
    if (isApplicant && latestMatch) {
      navigate('/bc/match');
    }
  };

  const handleSendMessage = () => {
    hideMatchPopup();
    if (latestMatch) {
      navigate(`/bc/chat/${latestMatch.id}`);
    }
  };

  const handleRefresh = () => {
    // Reset profiles for demo
    if (isApplicant) {
      setProfiles(shuffleBCProfiles(mockBCMembers));
    } else {
      setProfiles(shuffleBCProfiles(mockBCApplicants));
    }
  };

  // Empty state
  if (availableProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col">
        <BCHeader showBack={false} />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-medium-gray/20 rounded-full flex items-center justify-center mb-6">
            <Coffee className="w-10 h-10 text-cyan-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 text-center">
            No more profiles
          </h2>
          <p className="text-medium-gray font-mono text-sm text-center mb-6">
            {isApplicant
              ? "You've seen all available BC members. Check back later for new members!"
              : "You've reviewed all applicants. Check back later for new applications!"}
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold
                       border-3 border-black shadow-brutalist
                       hover:shadow-none hover:translate-x-1 hover:translate-y-1
                       transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            REFRESH PROFILES
          </button>
          {isMemberUser && (
            <button
              onClick={() => navigate('/bc/matches')}
              className="mt-4 text-cyan-500 font-mono text-sm underline"
            >
              View your coffee chats
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      <BCHeader showBack={false} />

      {/* Card Stack */}
      <div className="flex-1 relative px-4 py-4 overflow-hidden">
        <div className="relative h-full max-w-md mx-auto">
          <AnimatePresence>
            {availableProfiles.slice(0, 3).map((profile, index) => (
              <BCProfileCard
                key={profile.id}
                profile={profile}
                isTop={index === 0}
                stackIndex={index}
                swipeState={index === 0 ? swipeState : undefined}
                handlers={index === 0 ? handlers : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-6 pt-2">
        <div className="flex justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={swipeLeft}
            className="w-16 h-16 bg-white border-3 border-black shadow-brutalist
                       flex items-center justify-center
                       hover:bg-hot-pink hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={swipeRight}
            className="w-16 h-16 bg-cyan-500 border-3 border-black shadow-brutalist
                       flex items-center justify-center
                       hover:bg-cyan-400 transition-colors"
          >
            <Coffee className="w-8 h-8 text-black" />
          </motion.button>
        </div>
        <p className="text-center mt-3 text-medium-gray font-mono text-xs">
          {isApplicant
            ? 'Swipe right to request a coffee chat'
            : 'Swipe right to accept coffee chat'}
        </p>
      </div>

      {/* Match Popup */}
      <BCMatchPopup
        isOpen={showMatchPopup}
        match={latestMatch}
        onClose={handleMatchPopupClose}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
