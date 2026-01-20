import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, User, Briefcase, MapPin, Clock } from 'lucide-react';
import bcApiService from '../../services/bcApi';

interface PendingMember {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    photo_url: string;
  };
  year: string;
  major: string;
  semesters_in_bc: number;
  areas_of_expertise: string[];
  availability: string;
  bio: string;
  project_experience: string;
}

export function AdminPendingMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      const data = await bcApiService.getAdminPendingMembers();
      setMembers(data.pending_members || []);
    } catch (err) {
      console.error('Failed to load pending members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId: number) => {
    setProcessingId(memberId);
    try {
      await bcApiService.adminApproveMember(memberId, 'approve');
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Failed to approve member:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (memberId: number) => {
    if (!confirm('Are you sure you want to reject this application?')) return;

    setProcessingId(memberId);
    try {
      await bcApiService.adminApproveMember(memberId, 'reject');
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Failed to reject member:', err);
    } finally {
      setProcessingId(null);
    }
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white">PENDING BC MEMBERS</h1>
            <p className="text-medium-gray text-sm">{members.length} awaiting approval</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-6">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-medium-gray">No pending applications</p>
          </div>
        ) : (
          <AnimatePresence>
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-800/50 rounded-xl p-4 mb-4 border border-zinc-700"
              >
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={member.user.photo_url || '/profiles/default.jpg'}
                    alt={member.user.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{member.user.name}</h3>
                    <p className="text-sm text-medium-gray">{member.user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-zinc-700 text-xs text-white rounded">
                        {member.year}
                      </span>
                      <span className="px-2 py-1 bg-zinc-700 text-xs text-white rounded">
                        {member.major}
                      </span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-xs text-cyan-400 rounded">
                        {member.semesters_in_bc} semesters in BC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-3">
                  <p className="text-xs text-medium-gray mb-1">Areas of Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {member.areas_of_expertise.map((area, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-500/20 text-xs text-teal-400 rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-3">
                  <p className="text-xs text-medium-gray mb-1">Availability</p>
                  <p className="text-sm text-white">{member.availability}</p>
                </div>

                {/* Bio */}
                <div className="mb-3">
                  <p className="text-xs text-medium-gray mb-1">Bio</p>
                  <p className="text-sm text-light-gray">{member.bio}</p>
                </div>

                {/* Project Experience */}
                {member.project_experience && (
                  <div className="mb-4">
                    <p className="text-xs text-medium-gray mb-1">Project Experience</p>
                    <p className="text-sm text-light-gray">{member.project_experience}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(member.id)}
                    disabled={processingId === member.id}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg
                             hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    APPROVE
                  </button>
                  <button
                    onClick={() => handleReject(member.id)}
                    disabled={processingId === member.id}
                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg
                             hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    REJECT
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
