import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, User } from 'lucide-react';
import { UserProfile } from '../services/types';
import { VerifiedBadge } from './ui/Badge';
import { InterestList } from './InterestTag';
import { useSwipe, SwipeState } from '../hooks/useSwipe';

interface ProfileCardProps {
  profile: UserProfile;
  onLike: () => void;
  onPass: () => void;
  isTop?: boolean;
  stackIndex?: number;
}

export function ProfileCard({
  profile,
  onLike,
  onPass,
  isTop = true,
  stackIndex = 0,
}: ProfileCardProps) {
  const { state, handlers, swipeLeft, swipeRight } = useSwipe({
    threshold: 100,
    onSwipeLeft: onPass,
    onSwipeRight: onLike,
  });

  const scale = 1 - stackIndex * 0.05;
  const translateY = stackIndex * 8;

  const cardStyle: React.CSSProperties = isTop
    ? {
        transform: `translateX(${state.x}px) translateY(${state.y}px) rotate(${state.rotation}deg)`,
        cursor: state.isDragging ? 'grabbing' : 'grab',
        zIndex: 10 - stackIndex,
      }
    : {
        transform: `scale(${scale}) translateY(${translateY}px)`,
        zIndex: 10 - stackIndex,
      };

  return (
    <div
      className={`absolute inset-x-5 top-0 ${isTop ? 'swipeable' : 'pointer-events-none'}`}
      style={cardStyle}
      {...(isTop ? handlers : {})}
    >
      {/* Swipe indicators */}
      {isTop && (
        <>
          <SwipeIndicator
            direction="right"
            visible={state.direction === 'right'}
          />
          <SwipeIndicator
            direction="left"
            visible={state.direction === 'left'}
          />
        </>
      )}

      {/* Card content */}
      <div className="bg-dark-gray rounded-lg overflow-hidden shadow-brutalist-lg">
        {/* Profile image area */}
        <div className="relative h-[420px] bg-gradient-to-b from-medium-gray/80 to-dark-gray flex flex-col">
          {/* Profile photo */}
          <div className="flex-1 relative overflow-hidden">
            <img
              src={profile.photoUrl || `https://i.pravatar.cc/400?u=${profile.id}`}
              alt={profile.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=4D4D4D&color=fff&size=400`;
              }}
            />
          </div>

          {/* Verified badge */}
          {profile.isVerified && (
            <div className="absolute top-4 left-4 z-20">
              <VerifiedBadge />
            </div>
          )}

          {/* Profile info - at bottom with gradient background */}
          <div className="relative z-10 p-5 bg-gradient-to-t from-black via-black/90 to-transparent">
            <h2 className="text-2xl font-black text-white uppercase mb-1">
              {profile.name}
            </h2>
            <p className="text-xs font-mono text-light-gray uppercase tracking-wider mb-3">
              {profile.role} @ {profile.company}
            </p>

            {/* Hot take */}
            {profile.hotTake && (
              <div className="flex gap-2 mb-3">
                <div className="w-1 bg-acid-yellow rounded-full flex-shrink-0" />
                <p className="text-sm text-white/90 line-clamp-2 italic">
                  "{profile.hotTake}"
                </p>
              </div>
            )}

            {/* Interests */}
            <InterestList
              interests={profile.interests}
              size="sm"
            />
          </div>
        </div>

        {/* Action buttons */}
        {isTop && (
          <div className="flex items-center justify-center gap-10 py-5 px-5 bg-dark-gray">
            <ActionButton
              variant="pass"
              onClick={(e) => {
                e.stopPropagation();
                swipeLeft();
              }}
            />
            <ActionButton
              variant="like"
              onClick={(e) => {
                e.stopPropagation();
                swipeRight();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface SwipeIndicatorProps {
  direction: 'left' | 'right';
  visible: boolean;
}

function SwipeIndicator({ direction, visible }: SwipeIndicatorProps) {
  const isRight = direction === 'right';

  return (
    <div
      className={`
        absolute top-20 z-20 px-4 py-2
        border-4 rounded-lg
        text-4xl font-black
        transform
        transition-opacity duration-150
        ${isRight
          ? 'left-5 border-success-green text-success-green -rotate-[15deg]'
          : 'right-5 border-hot-pink text-hot-pink rotate-[15deg]'
        }
        ${visible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {isRight ? 'CONNECT' : 'PASS'}
    </div>
  );
}

interface ActionButtonProps {
  variant: 'like' | 'pass';
  onClick: (e: React.MouseEvent) => void;
}

function ActionButton({ variant, onClick }: ActionButtonProps) {
  const isLike = variant === 'like';

  return (
    <button
      onClick={onClick}
      className={`
        w-[60px] h-[60px] rounded-full
        flex items-center justify-center
        shadow-brutalist-sm
        active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
        transition-all duration-100
        ${isLike ? 'bg-acid-yellow' : 'bg-white'}
      `}
    >
      {isLike ? (
        <Zap size={28} className="text-black" fill="black" />
      ) : (
        <X size={28} className="text-black" strokeWidth={3} />
      )}
    </button>
  );
}

// Card stack component
interface CardStackProps {
  profiles: UserProfile[];
  onLike: (profile: UserProfile) => void;
  onPass: (profile: UserProfile) => void;
}

export function CardStack({ profiles, onLike, onPass }: CardStackProps) {
  const visibleCards = profiles.slice(0, 3);

  return (
    <div className="relative h-[520px]">
      <AnimatePresence>
        {visibleCards.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ x: 500, opacity: 0, rotate: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <ProfileCard
              profile={profile}
              onLike={() => onLike(profile)}
              onPass={() => onPass(profile)}
              isTop={index === 0}
              stackIndex={index}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
