import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchRow, NewMatchCard } from '../components/MatchRow';
import { useApp } from '../context/AppContext';
import { Match } from '../services/types';

export function Matches() {
  const navigate = useNavigate();
  const { matches } = useApp();

  // Use local matches from context (persisted in localStorage)
  const newMatches = matches.filter((m) => !m.lastMessage);
  const conversations = matches.filter((m) => m.lastMessage);

  const handleMatchClick = (match: Match) => {
    navigate(`/chat/${match.matchId}`, { state: { match } });
  };

  if (matches.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-dark-gray pb-20 safe-top">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-xl font-black text-white">MATCHES</h1>
      </div>

      {/* New matches section */}
      {newMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 px-6 mb-4">
            <span className="text-xs font-mono text-light-gray uppercase tracking-wider">
              New Matches
            </span>
            <span className="px-2 py-0.5 bg-acid-yellow text-black text-[10px] font-bold rounded-full">
              {newMatches.length}
            </span>
          </div>

          <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
            {newMatches.map((match) => (
              <NewMatchCard
                key={match.id}
                match={match}
                onClick={() => handleMatchClick(match)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Messages section */}
      <div>
        <div className="flex items-center gap-2 px-6 mb-4">
          <span className="text-xs font-mono text-light-gray uppercase tracking-wider">
            Messages
          </span>
        </div>

        {conversations.length > 0 ? (
          <div className="px-4 space-y-2">
            {conversations.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchRow
                  match={match}
                  onClick={() => handleMatchClick(match)}
                />
              </motion.div>
            ))}
          </div>
        ) : newMatches.length > 0 ? (
          <div className="px-6 py-12 text-center">
            <MessageCircle size={32} className="mx-auto text-medium-gray mb-4" />
            <p className="text-medium-gray text-sm">No conversations yet</p>
            <p className="text-light-gray/50 text-xs mt-1">
              Tap a match above to start chatting!
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6 safe-top">
      <div className="w-24 h-24 rounded-full bg-medium-gray flex items-center justify-center mb-6">
        <Heart size={40} className="text-light-gray" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">NO MATCHES YET</h2>
      <p className="text-base text-medium-gray text-center">
        Start swiping to find your next professional connection
      </p>
    </div>
  );
}
