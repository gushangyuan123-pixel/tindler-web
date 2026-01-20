import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Check, X, CheckCircle, Clock, XCircle } from 'lucide-react';
import bcApiService from '../../services/bcApi';

interface Match {
  id: number;
  applicant: {
    id: number;
    user: {
      name: string;
      email: string;
      photo_url: string;
    };
    role: string;
  };
  bc_member: {
    id: number;
    user: {
      name: string;
      email: string;
      photo_url: string;
    };
    year: string;
    major: string;
  };
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  matched_at: string;
}

export function AdminMatches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await bcApiService.getAdminAllMatches();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (matchId: number, action: 'confirm' | 'reject' | 'complete') => {
    setProcessingId(matchId);
    try {
      await bcApiService.adminApproveMatch(matchId, action);
      // Update local state
      setMatches(matches.map(m =>
        m.id === matchId
          ? { ...m, status: action === 'confirm' ? 'confirmed' : action === 'complete' ? 'completed' : 'rejected' }
          : m
      ));
    } catch (err) {
      console.error('Failed to update match:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    completed: 'bg-cyan-500/20 text-cyan-400',
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    rejected: XCircle,
    completed: Coffee,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">COFFEE CHAT MATCHES</h1>
            <p className="text-medium-gray text-sm">{matches.length} total matches</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'pending', 'confirmed', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                         ${filter === f
                           ? 'bg-cyan-500 text-black'
                           : 'bg-zinc-800 text-medium-gray hover:text-white'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span className="ml-1">
                  ({matches.filter(m => m.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-6">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <Coffee className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-medium-gray">No matches found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match, index) => {
              const StatusIcon = statusIcons[match.status];

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusColors[match.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {match.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-medium-gray">
                      {new Date(match.matched_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Match Participants */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Applicant */}
                    <div className="flex-1 text-center">
                      <img
                        src={match.applicant.user.photo_url || '/profiles/default.jpg'}
                        alt={match.applicant.user.name}
                        className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
                      />
                      <p className="text-sm font-bold text-white truncate">{match.applicant.user.name}</p>
                      <p className="text-xs text-purple-400">{match.applicant.role}</p>
                    </div>

                    {/* Arrow */}
                    <div className="text-2xl text-cyan-500">↔</div>

                    {/* BC Member */}
                    <div className="flex-1 text-center">
                      <img
                        src={match.bc_member.user.photo_url || '/profiles/default.jpg'}
                        alt={match.bc_member.user.name}
                        className="w-14 h-14 rounded-full object-cover mx-auto mb-2"
                      />
                      <p className="text-sm font-bold text-white truncate">{match.bc_member.user.name}</p>
                      <p className="text-xs text-teal-400">{match.bc_member.year} - {match.bc_member.major}</p>
                    </div>
                  </div>

                  {/* Actions based on status */}
                  {match.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(match.id, 'confirm')}
                        disabled={processingId === match.id}
                        className="flex-1 py-2 bg-green-500 text-white text-sm font-bold rounded-lg
                                 hover:bg-green-400 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> CONFIRM
                      </button>
                      <button
                        onClick={() => handleAction(match.id, 'reject')}
                        disabled={processingId === match.id}
                        className="flex-1 py-2 bg-red-500 text-white text-sm font-bold rounded-lg
                                 hover:bg-red-400 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" /> REJECT
                      </button>
                    </div>
                  )}

                  {match.status === 'confirmed' && (
                    <button
                      onClick={() => handleAction(match.id, 'complete')}
                      disabled={processingId === match.id}
                      className="w-full py-2 bg-cyan-500 text-black text-sm font-bold rounded-lg
                               hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Coffee className="w-4 h-4" /> MARK AS COMPLETED
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
