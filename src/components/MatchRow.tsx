import React from 'react';
import { Match } from '../services/types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { timeAgo, truncate } from '../utils/helpers';

interface MatchRowProps {
  match: Match;
  onClick: () => void;
}

export function MatchRow({ match, onClick }: MatchRowProps) {
  const { profile, lastMessage, lastMessageAt, unreadCount } = match;

  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center gap-3 p-3
        bg-dark-gray rounded-lg
        hover:bg-medium-gray/30 transition-colors
        text-left
      "
    >
      <Avatar
        src={profile.photoUrl}
        alt={profile.name}
        size="md"
        ring={unreadCount > 0}
        ringColor="yellow"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white truncate">{profile.name}</h3>
          {lastMessageAt && (
            <span className="text-[11px] font-mono text-medium-gray ml-2 flex-shrink-0">
              {timeAgo(lastMessageAt)}
            </span>
          )}
        </div>

        <p className="text-sm text-light-gray truncate">
          {lastMessage || `${profile.role} @ ${profile.company}`}
        </p>
      </div>

      {unreadCount > 0 && (
        <Badge variant="new" />
      )}
    </button>
  );
}

interface NewMatchCardProps {
  match: Match;
  onClick: () => void;
}

export function NewMatchCard({ match, onClick }: NewMatchCardProps) {
  const { profile, matchedAt } = match;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-2 min-w-[80px]"
    >
      <Avatar
        src={profile.photoUrl}
        alt={profile.name}
        size="lg"
        ring
        ringColor="yellow"
      />
      <span className="text-[10px] font-mono text-white truncate max-w-[70px]">
        {profile.name.split(' ')[0]}
      </span>
    </button>
  );
}
