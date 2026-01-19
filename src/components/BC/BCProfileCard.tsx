import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, Star, BookOpen, User } from 'lucide-react';
import { BCMemberProfile, BCApplicantProfile } from '../../services/types';

// Default placeholder for missing photos
const DEFAULT_PHOTO = '/profiles/default.jpg';

// Get full photo URL (handle relative paths from backend)
function getPhotoUrl(photoUrl: string | undefined): string {
  if (!photoUrl) return DEFAULT_PHOTO;
  // If it's a relative path starting with /media, prepend the API URL
  if (photoUrl.startsWith('/media/')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${apiUrl}${photoUrl}`;
  }
  return photoUrl;
}

interface BCProfileCardProps {
  profile: BCMemberProfile | BCApplicantProfile;
  isTop?: boolean;
  stackIndex?: number;
  swipeState?: {
    x: number;
    y: number;
    rotation: number;
    isDragging: boolean;
    direction: 'left' | 'right' | null;
  };
  handlers?: {
    onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseMove?: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseUp?: () => void;
    onMouseLeave?: () => void;
    onTouchStart?: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchMove?: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd?: () => void;
  };
}

function isBCMember(profile: BCMemberProfile | BCApplicantProfile): profile is BCMemberProfile {
  return 'semestersInBC' in profile;
}

export function BCProfileCard({ profile, isTop = false, stackIndex = 0, swipeState, handlers }: BCProfileCardProps) {
  const isMember = isBCMember(profile);
  const [imageError, setImageError] = useState(false);
  const photoUrl = getPhotoUrl(profile.photoUrl);

  // Calculate scale and position based on stack position
  const scale = 1 - stackIndex * 0.05;
  const translateY = stackIndex * 8;

  // Swipe indicator opacity
  const showConnect = swipeState?.isDragging && swipeState.x > 50;
  const showPass = swipeState?.isDragging && swipeState.x < -50;

  return (
    <motion.div
      className={`absolute inset-0 ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
      style={{
        zIndex: 10 - stackIndex,
        transform: isTop && swipeState
          ? `translateX(${swipeState.x}px) translateY(${swipeState.y}px) rotate(${swipeState.rotation}deg)`
          : `translateY(${translateY}px) scale(${scale})`,
      }}
      {...(isTop ? handlers : {})}
    >
      <div className="relative h-full bg-white border-3 border-black shadow-brutalist-lg overflow-hidden">
        {/* Profile Image */}
        <div className="relative h-[50%]">
          {imageError ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <User className="w-16 h-16 text-gray-400" />
            </div>
          ) : (
            <img
              src={photoUrl}
              alt={profile.name}
              className="w-full h-full object-cover object-top"
              draggable={false}
              onError={() => setImageError(true)}
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Swipe Indicators */}
          {isTop && (
            <>
              <motion.div
                className="absolute top-6 right-6 px-4 py-2 bg-cyan-500 border-3 border-black
                           font-bold text-lg transform rotate-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: showConnect ? 1 : 0 }}
              >
                CONNECT
              </motion.div>
              <motion.div
                className="absolute top-6 left-6 px-4 py-2 bg-hot-pink border-3 border-black
                           font-bold text-lg text-white transform -rotate-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: showPass ? 1 : 0 }}
              >
                PASS
              </motion.div>
            </>
          )}

          {/* Role Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-cyan-500 text-black font-mono font-bold text-xs border-2 border-black">
              {isMember ? 'BC MEMBER' : 'APPLICANT'}
            </span>
          </div>

          {/* Name and Role */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="font-mono text-sm opacity-90">
              {isMember ? `${profile.year} · ${profile.major}` : profile.role}
            </p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="h-[50%] p-4 overflow-y-auto">
          {isMember ? (
            // BC Member details
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm">
                  <GraduationCap className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono">{profile.semestersInBC} semester{profile.semestersInBC !== 1 ? 's' : ''} in BC</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono">{profile.availability}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono text-xs text-medium-gray">EXPERTISE</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.areasOfExpertise.map((area) => (
                    <span
                      key={area}
                      className="px-2 py-1 bg-cyan-500/10 text-cyan-600 font-mono text-xs border border-cyan-500/30"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-medium-gray font-mono leading-relaxed">
                {profile.bio}
              </p>

              {profile.projectExperience && (
                <div className="mt-4 pt-4 border-t border-light-gray">
                  <div className="flex items-center gap-1 mb-2">
                    <BookOpen className="w-4 h-4 text-cyan-500" />
                    <span className="font-mono text-xs text-medium-gray">PROJECT EXPERIENCE</span>
                  </div>
                  <p className="text-xs font-mono text-medium-gray leading-relaxed">
                    {profile.projectExperience}
                  </p>
                </div>
              )}
            </>
          ) : (
            // Applicant details
            <>
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono text-xs text-medium-gray">INTERESTS</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-cyan-500/10 text-cyan-600 font-mono text-xs border border-cyan-500/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="font-mono text-xs text-medium-gray block mb-1">WHY BC</span>
                <p className="text-sm text-dark-gray font-mono leading-relaxed">
                  "{profile.whyBC}"
                </p>
              </div>

              <div className="pt-4 border-t border-light-gray">
                <span className="font-mono text-xs text-medium-gray block mb-1">EXPERIENCE</span>
                <p className="text-sm text-medium-gray font-mono leading-relaxed">
                  {profile.relevantExperience}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
