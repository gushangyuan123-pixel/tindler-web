import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, Mail, Calendar } from 'lucide-react';
import bcApiService from '../../services/bcApi';

interface BCMember {
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
  is_approved: boolean;
}

export function AdminAllMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<BCMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await bcApiService.getAdminAllMembers();
      // Filter to only show approved members
      setMembers((data.members || []).filter((m: BCMember) => m.is_approved));
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
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
            <h1 className="text-xl font-black text-white">ALL BC MEMBERS</h1>
            <p className="text-medium-gray text-sm">{members.length} approved members</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-6">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-medium-gray">No approved members yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
              >
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={member.user.photo_url || '/profiles/default.jpg'}
                    alt={member.user.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{member.user.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-medium-gray">
                      <Mail className="w-3 h-3" />
                      {member.user.email}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-zinc-700 text-xs text-white rounded">
                        {member.year}
                      </span>
                      <span className="px-2 py-1 bg-zinc-700 text-xs text-white rounded">
                        {member.major}
                      </span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-xs text-cyan-400 rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {member.semesters_in_bc} semesters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                {member.areas_of_expertise.length > 0 && (
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
                )}

                {/* Availability */}
                {member.availability && (
                  <div className="mb-3">
                    <p className="text-xs text-medium-gray mb-1">Availability</p>
                    <p className="text-sm text-white">{member.availability}</p>
                  </div>
                )}

                {/* Bio */}
                {member.bio && (
                  <div>
                    <p className="text-xs text-medium-gray mb-1">Bio</p>
                    <p className="text-sm text-light-gray line-clamp-2">{member.bio}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
