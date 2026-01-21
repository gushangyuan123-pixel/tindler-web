import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Coffee, MessageCircle, Calendar, Star, GraduationCap, Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import { BCHeader } from '../../components/BC/BCHeader';

export function BCMatchConfirmation() {
  const navigate = useNavigate();
  const { userType, applicantMatch, isApplicant, isAuthenticated } = useBC();

  // Redirect if not an applicant or no match
  useEffect(() => {
    if (!userType) {
      navigate('/bc');
      return;
    }
    if (!isApplicant) {
      navigate('/bc/discover');
      return;
    }
    if (!applicantMatch) {
      navigate('/bc/discover');
    }
  }, [userType, isApplicant, applicantMatch, navigate]);

  if (!applicantMatch) return null;

  const bcMember = applicantMatch.bcMember;
  const matchStatus = (applicantMatch as any).status || 'confirmed';
  const isPending = matchStatus === 'pending' && isAuthenticated;
  const isConfirmed = matchStatus === 'confirmed';

  return (
    <div className="min-h-screen bg-dark-gray flex flex-col">
      <BCHeader showBack={false} title="Your Coffee Chat" />

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-3 border-black p-4 mb-6 text-center ${
            isPending ? 'bg-yellow-500' : 'bg-cyan-500'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isPending ? (
              <>
                <Clock className="w-6 h-6 text-black" />
                <span className="font-bold text-lg">PENDING APPROVAL</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-black" />
                <span className="font-bold text-lg">COFFEE CHAT CONFIRMED!</span>
              </>
            )}
          </div>
          <p className="text-sm font-mono">
            {isPending
              ? 'Waiting for admin to confirm your match'
              : "You've been matched with a BC member"}
          </p>
        </motion.div>

        {/* Pending Notice */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-100 border-2 border-yellow-500 p-3 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 font-mono">
              Your match is pending admin approval. You'll be able to message once it's confirmed.
            </p>
          </motion.div>
        )}

        {/* BC Member Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-3 border-black shadow-brutalist-lg overflow-hidden mb-6"
        >
          {/* Photo and Name */}
          <div className="relative h-48">
            <img
              src={bcMember.photoUrl}
              alt={bcMember.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-cyan-500 text-black font-mono text-xs font-bold border border-black">
                BC MEMBER
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h2 className="text-2xl font-bold">{bcMember.name}</h2>
              <p className="font-mono text-sm">{bcMember.year} · {bcMember.major}</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-cyan-500" />
                <span className="font-mono">{bcMember.semestersInBC} semester{bcMember.semestersInBC !== 1 ? 's' : ''} in BC</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-cyan-500" />
                <span className="font-mono">{bcMember.availability}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-cyan-500" />
                <span className="font-mono text-xs text-medium-gray">EXPERTISE</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bcMember.areasOfExpertise.map((area) => (
                  <span
                    key={area}
                    className="px-2 py-1 bg-cyan-500/10 text-cyan-600 font-mono text-xs border border-cyan-500/30"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm text-medium-gray font-mono">{bcMember.bio}</p>

            {bcMember.projectExperience && (
              <div className="pt-3 border-t border-light-gray">
                <div className="flex items-center gap-1 mb-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  <span className="font-mono text-xs text-medium-gray">PROJECT EXPERIENCE</span>
                </div>
                <p className="text-xs font-mono text-medium-gray leading-relaxed">
                  {bcMember.projectExperience}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border-3 border-black p-4 mb-6"
        >
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-500" />
            Next Steps
          </h3>
          <ol className="space-y-3 font-mono text-sm text-medium-gray">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-cyan-500 text-black flex items-center justify-center flex-shrink-0 font-bold text-xs">
                1
              </span>
              <span>Send a message to introduce yourself</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-cyan-500 text-black flex items-center justify-center flex-shrink-0 font-bold text-xs">
                2
              </span>
              <span>Schedule a time based on their availability ({bcMember.availability})</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-cyan-500 text-black flex items-center justify-center flex-shrink-0 font-bold text-xs">
                3
              </span>
              <span>Prepare questions about BC and consulting</span>
            </li>
          </ol>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {isPending ? (
            <button
              disabled
              className="w-full py-4 bg-gray-300 text-gray-500 font-bold border-3 border-black
                         flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Clock className="w-5 h-5" />
              WAITING FOR APPROVAL
            </button>
          ) : (
            <button
              onClick={() => navigate(`/bc/chat/${applicantMatch.id}`)}
              className="w-full py-4 bg-cyan-500 text-black font-bold border-3 border-black
                         shadow-brutalist flex items-center justify-center gap-2
                         hover:shadow-none hover:translate-x-1 hover:translate-y-1
                         transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              MESSAGE {bcMember.name.split(' ')[0].toUpperCase()}
            </button>
          )}
        </motion.div>
      </div>

      {/* Footer note */}
      <div className="px-4 pb-6 text-center">
        <p className="text-xs text-medium-gray font-mono">
          {isPending
            ? 'Check back soon for confirmation!'
            : 'This is your one coffee chat opportunity. Make it count!'}
        </p>
      </div>
    </div>
  );
}
