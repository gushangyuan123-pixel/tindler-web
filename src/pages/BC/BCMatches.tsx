import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coffee, MessageCircle, ArrowRight, Users } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import { BCHeader } from '../../components/BC/BCHeader';
import { BCMatch } from '../../services/types';

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface MatchRowProps {
  match: BCMatch;
  onClick: () => void;
}

function MatchRow({ match, onClick }: MatchRowProps) {
  const lastMessage = match.messages[match.messages.length - 1];

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="w-full bg-white border-3 border-black p-4 flex items-center gap-4
                 hover:bg-light-gray transition-colors text-left"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 border-2 border-black overflow-hidden">
          <img
            src={match.applicant.photoUrl}
            alt={match.applicant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 border border-black
                        flex items-center justify-center">
          <Coffee className="w-3 h-3" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold truncate">{match.applicant.name}</h3>
          <span className="text-xs text-medium-gray font-mono flex-shrink-0">
            {formatDate(match.matchedAt)}
          </span>
        </div>
        <p className="text-sm text-medium-gray font-mono truncate">
          {match.applicant.role}
        </p>
        {lastMessage ? (
          <p className="text-xs text-medium-gray font-mono truncate mt-1">
            {lastMessage.isFromCurrentUser ? 'You: ' : ''}{lastMessage.content}
          </p>
        ) : (
          <p className="text-xs text-cyan-500 font-mono mt-1">
            Tap to start chatting
          </p>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="w-5 h-5 text-medium-gray flex-shrink-0" />
    </motion.button>
  );
}

export function BCMatches() {
  const navigate = useNavigate();
  const { userType, isBCMember, memberMatches } = useBC();

  // Redirect if not a BC member
  useEffect(() => {
    if (!userType) {
      navigate('/bc');
      return;
    }
    if (!isBCMember) {
      navigate('/bc/discover');
    }
  }, [userType, isBCMember, navigate]);

  const handleMatchClick = (match: BCMatch) => {
    navigate(`/bc/chat/${match.id}`);
  };

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      <BCHeader
        showBack={true}
        title="My Coffee Chats"
        rightAction={
          <button
            onClick={() => navigate('/bc/discover')}
            className="px-3 py-1 bg-cyan-500 text-black font-mono text-xs font-bold border-2 border-black"
          >
            DISCOVER
          </button>
        }
      />

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {memberMatches.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-medium-gray/20 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-cyan-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No coffee chats yet</h2>
            <p className="text-medium-gray font-mono text-sm mb-6">
              Start swiping to accept coffee chat requests from applicants
            </p>
            <button
              onClick={() => navigate('/bc/discover')}
              className="px-6 py-3 bg-cyan-500 text-black font-bold border-3 border-black
                         shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1
                         transition-all"
            >
              BROWSE APPLICANTS
            </button>
          </div>
        ) : (
          // Matches list
          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-cyan-500 border-3 border-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5" />
                <span className="font-bold">{memberMatches.length} Coffee Chats</span>
              </div>
              <span className="font-mono text-sm">
                {memberMatches.filter(m => m.messages.length > 0).length} active
              </span>
            </div>

            {/* Match list */}
            <div className="space-y-3">
              {memberMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchRow match={match} onClick={() => handleMatchClick(match)} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
