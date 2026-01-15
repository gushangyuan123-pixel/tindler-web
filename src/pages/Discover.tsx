import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Sparkles, RefreshCw } from 'lucide-react';
import { CardStack } from '../components/ProfileCard';
import { MatchPopup } from '../components/MatchPopup';
import { Button } from '../components/ui/Button';
import { InterestList } from '../components/InterestTag';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../services/types';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export function Discover() {
  const navigate = useNavigate();
  const {
    profiles,
    setProfiles,
    removeProfile,
    showMatchPopup,
    latestMatch,
    latestMatchFull,
    showMatch,
    hideMatchPopup,
    incrementLikes,
    currentUser,
    getFilteredProfiles,
    selectedInterests,
    selectedRoles,
    toggleInterest,
    toggleRole,
    clearFilters,
    availableInterests,
    availableRoles,
    addMatch,
  } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      // Fetch profiles from real backend API
      const response = await apiService.getSwipeProfiles();
      if (response.success && response.profiles) {
        // Shuffle and exclude current user
        const shuffled = response.profiles
          .sort(() => Math.random() - 0.5)
          .filter((p: UserProfile) => p.id !== currentUser?.id);
        setProfiles(shuffled);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (profile: UserProfile) => {
    incrementLikes();
    removeProfile(profile.id);

    try {
      // Call real backend API to like profile
      const response = await apiService.likeProfile(profile.id);

      if (response.success && response.isMatch) {
        // Real match from backend!
        const newMatch = {
          id: profile.id,
          matchId: response.matchId,
          profile,
          matchedAt: new Date(),
          unreadCount: 0,
        };
        addMatch(newMatch);
        showMatch(profile, newMatch);
      }
    } catch (error) {
      console.error('Error liking profile:', error);
    }
  };

  const handlePass = async (profile: UserProfile) => {
    removeProfile(profile.id);
    try {
      await apiService.passProfile(profile.id);
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  };

  const handleSendMessage = () => {
    if (latestMatchFull) {
      hideMatchPopup();
      // Navigate directly to chat with match data
      navigate(`/chat/${latestMatchFull.matchId}`, { state: { match: latestMatchFull } });
    } else {
      hideMatchPopup();
      navigate('/matches');
    }
  };

  const handleKeepSwiping = () => {
    hideMatchPopup();
  };

  const filteredProfiles = getFilteredProfiles();
  const hasFilters = selectedInterests.size > 0 || selectedRoles.size > 0;

  return (
    <div className="min-h-screen bg-dark-gray pb-20 safe-top">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-black text-white">DISCOVER</h1>
          <p className="text-xs font-mono text-light-gray">
            {filteredProfiles.length} professionals nearby
          </p>
        </div>

        <button
          onClick={() => setShowFilters(true)}
          className={`
            w-11 h-11 rounded-lg flex items-center justify-center relative
            shadow-brutalist-sm transition-all bg-acid-yellow
          `}
        >
          <SlidersHorizontal size={20} className="text-black" />
          {hasFilters && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-hot-pink rounded-full text-[10px] text-white flex items-center justify-center">
              {selectedInterests.size + selectedRoles.size}
            </span>
          )}
        </button>
      </div>

      {/* Card stack */}
      <div className="px-5">
        {isLoading ? (
          <div className="h-[520px] flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-acid-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredProfiles.length > 0 ? (
          <CardStack
            profiles={filteredProfiles}
            onLike={handleLike}
            onPass={handlePass}
          />
        ) : (
          <EmptyState onRefresh={loadProfiles} />
        )}
      </div>

      {/* Match popup */}
      <MatchPopup
        isOpen={showMatchPopup}
        matchedProfile={latestMatch}
        currentUserName={currentUser?.name?.split(' ')[0]}
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
        onClose={hideMatchPopup}
      />

      {/* Filter sheet */}
      {showFilters && (
        <FilterSheet
          selectedInterests={selectedInterests}
          selectedRoles={selectedRoles}
          availableInterests={availableInterests}
          availableRoles={availableRoles}
          onToggleInterest={toggleInterest}
          onToggleRole={toggleRole}
          onClear={clearFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="h-[520px] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-acid-yellow/20 flex items-center justify-center mb-6">
        <Sparkles size={32} className="text-acid-yellow" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">NO MORE PROFILES</h2>
      <p className="text-base text-medium-gray text-center mb-8">
        Check back later for new connections
      </p>
      <Button onClick={onRefresh} icon={<RefreshCw size={18} />}>
        REFRESH
      </Button>
    </div>
  );
}

interface FilterSheetProps {
  selectedInterests: Set<string>;
  selectedRoles: Set<string>;
  availableInterests: readonly string[];
  availableRoles: readonly string[];
  onToggleInterest: (interest: string) => void;
  onToggleRole: (role: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function FilterSheet({
  selectedInterests,
  selectedRoles,
  availableInterests,
  availableRoles,
  onToggleInterest,
  onToggleRole,
  onClear,
  onClose,
}: FilterSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="absolute bottom-0 left-0 right-0 bg-dark-gray rounded-t-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">FILTERS</h2>
            <button
              onClick={onClear}
              className="text-sm text-acid-yellow font-mono"
            >
              Clear all
            </button>
          </div>

          {/* Roles section */}
          <div className="mb-8">
            <h3 className="text-xs font-mono text-light-gray uppercase tracking-wider mb-4">
              Program
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => onToggleRole(role)}
                  className={`
                    px-4 py-2 rounded-full font-mono text-sm transition-colors
                    ${selectedRoles.has(role)
                      ? 'bg-acid-yellow text-black'
                      : 'bg-medium-gray/50 text-white'
                    }
                  `}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Interests section */}
          <div className="mb-8">
            <h3 className="text-xs font-mono text-light-gray uppercase tracking-wider mb-4">
              Interests
            </h3>
            <InterestList
              interests={[...availableInterests]}
              selectedInterests={selectedInterests}
              onToggle={onToggleInterest}
              wrap
            />
          </div>

          {/* Apply button */}
          <Button fullWidth onClick={onClose}>
            APPLY FILTERS
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
