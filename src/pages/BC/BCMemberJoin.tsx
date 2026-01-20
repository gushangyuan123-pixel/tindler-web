import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Check, AlertCircle, Loader } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import bcApiService from '../../services/bcApi';
import { BC_EXPERTISE_AREAS, BC_AVAILABILITY_OPTIONS } from '../../services/types';

const BC_MEMBER_YEARS = ['Sophomore', 'Junior', 'Senior'];

const MAJORS = [
  'Business Administration',
  'Economics',
  'Data Science',
  'Computer Science',
  'IEOR',
  'Political Economy',
  'Statistics',
  'Other',
];

export function BCMemberJoin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loadUserFromAPI, setUserType, setCurrentProfile, setCompletedSetup } = useBC();

  const inviteCode = searchParams.get('code') || '';

  const [isValidating, setIsValidating] = useState(true);
  const [isValidCode, setIsValidCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [customMajor, setCustomMajor] = useState('');
  const [semestersInBC, setSemestersInBC] = useState(1);
  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [projectExperience, setProjectExperience] = useState('');

  // Validate invite code on mount
  useEffect(() => {
    const validateCode = async () => {
      if (!inviteCode) {
        setIsValidCode(false);
        setIsValidating(false);
        return;
      }

      try {
        const result = await bcApiService.validateInviteCode(inviteCode);
        setIsValidCode(result.valid);
      } catch {
        setIsValidCode(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateCode();
  }, [inviteCode]);

  // Handle Google login
  const handleLogin = () => {
    localStorage.setItem('bc_intended_role', 'bc_member');
    localStorage.setItem('bc_invite_code', inviteCode);
    window.location.href = bcApiService.getGoogleLoginUrl();
  };

  // Toggle expertise area
  const toggleExpertise = (area: string) => {
    setAreasOfExpertise(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!year || !major) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalMajor = major === 'Other' ? customMajor : major;

      const result = await bcApiService.joinAsBCMember({
        invite_code: inviteCode,
        year,
        major: finalMajor,
        semesters_in_bc: semestersInBC,
        areas_of_expertise: areasOfExpertise,
        availability,
        bio,
        project_experience: projectExperience,
      });

      // Update context
      setUserType('bc_member');
      setCurrentProfile({
        id: String(result.profile.id),
        name: result.profile.user?.name || '',
        photoUrl: result.profile.user?.photo_url || '',
        year: result.profile.year,
        major: result.profile.major,
        semestersInBC: result.profile.semesters_in_bc,
        areasOfExpertise: result.profile.areas_of_expertise || [],
        availability: result.profile.availability,
        bio: result.profile.bio,
        projectExperience: result.profile.project_experience,
      });
      setCompletedSetup(true);

      // Redirect to discover
      navigate('/bc/discover');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-medium-gray font-mono text-sm">Validating invite code...</p>
        </div>
      </div>
    );
  }

  // Invalid code
  if (!isValidCode) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite Code</h1>
        <p className="text-medium-gray text-center mb-6">
          {inviteCode
            ? 'This invite code is not valid or has expired.'
            : 'No invite code provided.'}
        </p>
        <button
          onClick={() => navigate('/bc')}
          className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Coffee className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to BC Coffee Chat!</h1>
          <p className="text-medium-gray mb-8">
            Sign in with your Berkeley email to complete your BC member profile.
          </p>
          <button
            onClick={handleLogin}
            className="w-full max-w-xs px-6 py-4 bg-white text-black font-bold rounded-lg
                     hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
          <p className="text-xs text-medium-gray mt-4">
            Only @berkeley.edu emails are allowed
          </p>
        </motion.div>
      </div>
    );
  }

  // Logged in - show profile form
  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Coffee className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Complete Your Profile</h1>
            <p className="text-medium-gray text-sm">BC Member Setup</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Year */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {BC_MEMBER_YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                           ${year === y
                             ? 'bg-cyan-500 text-black'
                             : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Major */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Major <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {MAJORS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMajor(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${major === m
                             ? 'bg-cyan-500 text-black'
                             : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                {m}
              </button>
            ))}
          </div>
          {major === 'Other' && (
            <input
              type="text"
              value={customMajor}
              onChange={(e) => setCustomMajor(e.target.value)}
              placeholder="Enter your major"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                       placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          )}
        </div>

        {/* Semesters in BC */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Semesters in BC</label>
          <input
            type="number"
            min="1"
            max="10"
            value={semestersInBC}
            onChange={(e) => setSemestersInBC(parseInt(e.target.value) || 1)}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Areas of Expertise */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Areas of Expertise</label>
          <div className="flex flex-wrap gap-2">
            {BC_EXPERTISE_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleExpertise(area)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${areasOfExpertise.includes(area)
                             ? 'bg-teal-500 text-white'
                             : 'bg-zinc-800 text-medium-gray hover:text-white'}`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Availability</label>
          <div className="flex flex-wrap gap-2">
            {BC_AVAILABILITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAvailability(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${availability === opt
                             ? 'bg-cyan-500 text-black'
                             : 'bg-zinc-800 text-medium-gray hover:text-white'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell applicants about yourself..."
            rows={3}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Project Experience */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Project Experience</label>
          <textarea
            value={projectExperience}
            onChange={(e) => setProjectExperience(e.target.value)}
            placeholder="Share your BC project experience..."
            rows={3}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-cyan-500 text-black font-bold text-lg rounded-lg
                   hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              COMPLETE SETUP
            </>
          )}
        </button>
      </form>
    </div>
  );
}
