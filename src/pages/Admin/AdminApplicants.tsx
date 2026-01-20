import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, XCircle } from 'lucide-react';
import bcApiService from '../../services/bcApi';

interface Applicant {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    photo_url: string;
  };
  role: string;
  why_bc: string;
  relevant_experience: string;
  interests: string[];
  has_been_matched: boolean;
}

export function AdminApplicants() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    try {
      const data = await bcApiService.getAdminAllApplicants();
      setApplicants(data.applicants || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
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
            <h1 className="text-xl font-black text-white">ALL APPLICANTS</h1>
            <p className="text-medium-gray text-sm">{applicants.length} total applicants</p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-6">
        {applicants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-medium-gray">No applicants yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant, index) => (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
              >
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-3">
                  <img
                    src={applicant.user.photo_url || '/profiles/default.jpg'}
                    alt={applicant.user.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{applicant.user.name}</h3>
                      {applicant.has_been_matched ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                          <CheckCircle className="w-3 h-3" /> Matched
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                          <XCircle className="w-3 h-3" /> Not Matched
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-medium-gray">{applicant.user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                      {applicant.role}
                    </span>
                  </div>
                </div>

                {/* Interests */}
                <div className="mb-3">
                  <p className="text-xs text-medium-gray mb-1">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {applicant.interests.map((interest, i) => (
                      <span key={i} className="px-2 py-1 bg-zinc-700 text-xs text-white rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Why BC */}
                <div className="mb-3">
                  <p className="text-xs text-medium-gray mb-1">Why BC?</p>
                  <p className="text-sm text-light-gray line-clamp-3">{applicant.why_bc}</p>
                </div>

                {/* Experience */}
                <div>
                  <p className="text-xs text-medium-gray mb-1">Relevant Experience</p>
                  <p className="text-sm text-light-gray line-clamp-2">{applicant.relevant_experience}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
