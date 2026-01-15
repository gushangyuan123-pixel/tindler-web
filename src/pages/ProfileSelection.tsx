import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { UserProfile } from '../services/types';

interface ProfileSelectionProps {
  onComplete: () => void;
}

export function ProfileSelection({ onComplete }: ProfileSelectionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { setHasSelectedProfile, setCurrentUser } = useApp();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await apiService.getAllProfiles();
      if (response.success && response.profiles) {
        setAllProfiles(response.profiles);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = allProfiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProfile = (profileId: string) => {
    setSelectedId(profileId);
  };

  const handleContinue = async () => {
    if (!selectedId) return;

    const selected = allProfiles.find((p) => p.id === selectedId);
    if (selected) {
      try {
        // Claim profile in backend
        await apiService.claimProfile(selectedId);
      } catch (error) {
        console.error('Error claiming profile:', error);
      }

      setCurrentUser({
        id: selected.id,
        name: selected.name,
        role: selected.role,
        company: selected.company,
        bio: selected.bio,
        hotTake: selected.hotTake,
        sideProjects: selected.sideProjects,
        interests: selected.interests,
        photoUrl: selected.photoUrl,
        isVerified: selected.isVerified,
      });
      setHasSelectedProfile(true);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col safe-top">
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-black text-white mb-2"
        >
          SELECT YOUR PROFILE
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-medium-gray"
        >
          Pick yourself to see your matches
        </motion.p>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-gray"
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-medium-gray/30 rounded-lg text-white placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-acid-yellow"
          />
        </div>
      </div>

      {/* Profile grid */}
      <div className="flex-1 overflow-y-auto px-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-3 border-acid-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
        <div className="grid grid-cols-3 gap-4 pb-32">
          {filteredProfiles.map((profile, index) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleSelectProfile(profile.id)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all
                ${selectedId === profile.id ? 'bg-acid-yellow/20' : 'bg-transparent'}
                hover:bg-white/5
              `}
            >
              <div className="relative mb-2">
                <Avatar
                  src={profile.photoUrl}
                  alt={profile.name}
                  size="lg"
                  ring={selectedId === profile.id}
                  ringColor="yellow"
                  fallbackId={profile.id}
                />
                {selectedId === profile.id && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-acid-yellow rounded-full flex items-center justify-center">
                    <Check size={14} className="text-black" strokeWidth={3} />
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-white truncate w-full text-center">
                {profile.name.split(' ')[0]}
              </span>
              <span className="text-[9px] font-mono text-medium-gray truncate w-full text-center">
                {profile.role}
              </span>
            </motion.button>
          ))}
        </div>
        )}
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-dark-gray via-dark-gray to-transparent">
        <Button
          fullWidth
          onClick={handleContinue}
          disabled={!selectedId}
          icon={<ChevronRight size={18} />}
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
