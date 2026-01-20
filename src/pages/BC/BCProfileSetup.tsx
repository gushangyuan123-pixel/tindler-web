import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Loader, Upload } from 'lucide-react';
import { useBC } from '../../context/BCContext';
import { BCMemberProfile, BCApplicantProfile, BC_EXPERTISE_AREAS, BC_AVAILABILITY_OPTIONS } from '../../services/types';
import { mockBCMembers, mockBCApplicants, shuffleBCProfiles } from '../../data/mockBCProfiles';
import bcApiService from '../../services/bcApi';

// Applicant roles (can include various backgrounds)
const APPLICANT_ROLES = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

// BC Member years (all undergrads)
const BC_MEMBER_YEARS = ['Sophomore', 'Junior', 'Senior'];

// Common majors at Berkeley
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

export function BCProfileSetup() {
  const navigate = useNavigate();
  const { userType, setCurrentProfile, setCompletedSetup, setProfiles, isApplicant, isAuthenticated, apiUser } = useBC();

  // Common fields
  const [name, setName] = useState(apiUser?.name || '');
  const [photoUrl, setPhotoUrl] = useState(apiUser?.photo_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image must be smaller than 5MB');
      return;
    }

    if (isAuthenticated) {
      // Upload to server
      setIsUploadingPhoto(true);
      setSubmitError(null);
      try {
        const result = await bcApiService.uploadPhoto(file);
        setPhotoUrl(result.photo_url);
      } catch (error: any) {
        console.error('Failed to upload photo:', error);
        setSubmitError(error.response?.data?.error || 'Failed to upload photo');
      } finally {
        setIsUploadingPhoto(false);
      }
    } else {
      // Demo mode - use local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Applicant-specific fields
  const [applicantRole, setApplicantRole] = useState('');
  const [whyBC, setWhyBC] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  // BC Member-specific fields
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [semestersInBC, setSemestersInBC] = useState(1);
  const [bio, setBio] = useState('');
  const [projectExperience, setProjectExperience] = useState('');
  const [areasOfExpertise, setAreasOfExpertise] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');

  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);

  // Check whitelist status for BC members and redirect if needed
  React.useEffect(() => {
    const checkAccess = async () => {
      if (!userType) {
        navigate('/bc');
        return;
      }

      if (userType === 'bc_member') {
        // Check if user is whitelisted
        try {
          const status = await bcApiService.checkWhitelist();
          if (!status.is_whitelisted) {
            alert('You are not authorized to register as a BC member. Please contact garv.agarwal.in@berkeley.edu to be added to the whitelist.');
            navigate('/bc');
            return;
          }
          setIsWhitelisted(true);
        } catch {
          alert('Failed to verify BC member access. Please try again.');
          navigate('/bc');
        }
      }
    };

    checkAccess();
  }, [userType, navigate]);

  const toggleExpertise = (area: string) => {
    if (areasOfExpertise.includes(area)) {
      setAreasOfExpertise(areasOfExpertise.filter(a => a !== area));
    } else if (areasOfExpertise.length < 3) {
      setAreasOfExpertise([...areasOfExpertise, area]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else if (interests.length < 3) {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isAuthenticated) {
        // Save to API for authenticated users
        if (isApplicant) {
          const apiProfile = await bcApiService.createApplicantProfile({
            name,
            photo_url: photoUrl,
            role: applicantRole,
            why_bc: whyBC,
            relevant_experience: relevantExperience,
            interests,
          });

          const profile: BCApplicantProfile = {
            id: String(apiProfile.id),
            name: apiProfile.user?.name || name,
            photoUrl: apiProfile.user?.photo_url || photoUrl,
            role: apiProfile.role,
            whyBC: apiProfile.why_bc,
            relevantExperience: apiProfile.relevant_experience,
            interests: apiProfile.interests,
          };
          setCurrentProfile(profile);

          // Fetch BC members from API
          try {
            const discoverResponse = await bcApiService.getDiscoverProfiles();
            const discoverProfiles = discoverResponse.profiles || discoverResponse;
            setProfiles(discoverProfiles.map((p: any) => ({
              id: String(p.user?.id || p.id),  // Use user ID for API swipes
              name: p.user?.name || '',
              photoUrl: p.user?.photo_url || '/profiles/default.jpg',
              year: p.year,
              major: p.major,
              semestersInBC: p.semesters_in_bc,
              areasOfExpertise: p.areas_of_expertise || [],
              availability: p.availability,
              bio: p.bio,
              projectExperience: p.project_experience,
            })));
          } catch (discoverError) {
            console.error('Failed to fetch discover profiles, using mock data:', discoverError);
            setProfiles(shuffleBCProfiles(mockBCMembers));
          }
        } else {
          // BC Member profile creation (for whitelisted users)
          const result = await bcApiService.createBCMemberProfile({
            year,
            major,
            semesters_in_bc: semestersInBC,
            areas_of_expertise: areasOfExpertise,
            availability,
            bio,
            project_experience: projectExperience,
          });

          const profile: BCMemberProfile = {
            id: String(result.profile.id),
            name: result.profile.user?.name || name,
            photoUrl: result.profile.user?.photo_url || photoUrl,
            year: result.profile.year,
            major: result.profile.major,
            semestersInBC: result.profile.semesters_in_bc,
            areasOfExpertise: result.profile.areas_of_expertise || [],
            availability: result.profile.availability,
            bio: result.profile.bio,
            projectExperience: result.profile.project_experience,
          };
          setCurrentProfile(profile);

          // Fetch applicants from API
          try {
            const discoverResponse = await bcApiService.getDiscoverProfiles();
            const discoverProfiles = discoverResponse.profiles || discoverResponse;
            setProfiles(discoverProfiles.map((p: any) => ({
              id: String(p.user?.id || p.id),
              name: p.user?.name || '',
              photoUrl: p.user?.photo_url || '/profiles/default.jpg',
              role: p.role,
              whyBC: p.why_bc,
              relevantExperience: p.relevant_experience,
              interests: p.interests || [],
            })));
          } catch (discoverError) {
            console.error('Failed to fetch discover profiles, using mock data:', discoverError);
            setProfiles(shuffleBCProfiles(mockBCApplicants));
          }
        }
      } else {
        // Demo mode - use local state only
        if (isApplicant) {
          const profile: BCApplicantProfile = {
            id: `user-applicant-${Date.now()}`,
            name,
            photoUrl,
            role: applicantRole,
            whyBC,
            relevantExperience,
            interests,
          };
          setCurrentProfile(profile);
          setProfiles(shuffleBCProfiles(mockBCMembers));
        } else {
          const profile: BCMemberProfile = {
            id: `user-member-${Date.now()}`,
            name,
            photoUrl,
            year,
            major,
            semestersInBC,
            areasOfExpertise,
            availability,
            bio,
            projectExperience,
          };
          setCurrentProfile(profile);
          setProfiles(shuffleBCProfiles(mockBCApplicants));
        }
      }

      setCompletedSetup(true);
      navigate('/bc/discover');
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      setSubmitError(error.response?.data?.error || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = isApplicant
    ? name && applicantRole && whyBC && relevantExperience && interests.length > 0
    : name && year && major && bio && projectExperience && areasOfExpertise.length > 0 && availability;

  // Don't render until we know if BC member is whitelisted
  if (!userType) {
    return null;
  }

  // For BC members, wait for whitelist check
  if (userType === 'bc_member' && isWhitelisted === null) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-medium-gray font-mono text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-gray flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-dark-gray border-b-3 border-black z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/bc')}
            className="p-2 hover:bg-medium-gray/20 rounded"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="text-center">
            <span className="text-xs font-mono text-cyan-500 tracking-wider">
              {isApplicant ? 'APPLICANT' : 'BC MEMBER'}
            </span>
            <h1 className="text-white font-bold">Create Your Profile</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-6 pb-32 overflow-y-auto">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-medium-gray border-3 border-black overflow-hidden">
              {isUploadingPhoto ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Loader className="w-6 h-6 animate-spin text-cyan-500" />
                </div>
              ) : photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-medium-gray">
                  <Camera className="w-8 h-8 text-dark-gray" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={isUploadingPhoto}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-cyan-500 border-2 border-black
                         flex items-center justify-center hover:bg-cyan-400 transition-colors
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploadingPhoto ? (
                <Loader className="w-4 h-4 text-black animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-black" />
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <p className="text-medium-gray font-mono text-xs mt-2">
            Click to upload photo
          </p>
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-white font-mono text-sm mb-2">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 bg-white border-3 border-black font-mono
                       focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </motion.div>

        {/* Applicant Role */}
        {isApplicant && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-white font-mono text-sm mb-2">Year *</label>
            <div className="flex flex-wrap gap-2">
              {APPLICANT_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setApplicantRole(r)}
                  className={`px-4 py-2 border-2 border-black font-mono text-sm transition-all
                    ${applicantRole === r
                      ? 'bg-cyan-500 text-black'
                      : 'bg-white text-black hover:bg-light-gray'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Applicant-specific fields */}
        {isApplicant && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                Why do you want to join BC? *
              </label>
              <textarea
                value={whyBC}
                onChange={(e) => setWhyBC(e.target.value)}
                placeholder="Share your motivation for joining Berkeley Consulting..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-3 border-black font-mono
                           focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                Relevant Experience *
              </label>
              <textarea
                value={relevantExperience}
                onChange={(e) => setRelevantExperience(e.target.value)}
                placeholder="Describe your relevant experience..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-3 border-black font-mono
                           focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                Areas of Interest * (Select up to 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {BC_EXPERTISE_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleInterest(area)}
                    className={`px-3 py-1.5 border-2 border-black font-mono text-xs transition-all
                      ${interests.includes(area)
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white text-black hover:bg-light-gray'
                      }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {/* BC Member-specific fields */}
        {!isApplicant && (
          <>
            {/* Year */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-white font-mono text-sm mb-2">Year *</label>
              <div className="flex flex-wrap gap-2">
                {BC_MEMBER_YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`px-4 py-2 border-2 border-black font-mono text-sm transition-all
                      ${year === y
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white text-black hover:bg-light-gray'
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Major */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-white font-mono text-sm mb-2">Major *</label>
              <div className="flex flex-wrap gap-2">
                {MAJORS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMajor(m)}
                    className={`px-3 py-1.5 border-2 border-black font-mono text-xs transition-all
                      ${major === m
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white text-black hover:bg-light-gray'
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Semesters in BC */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                Semesters in BC *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSemestersInBC(s)}
                    className={`px-4 py-2 border-2 border-black font-mono text-sm transition-all
                      ${semestersInBC === s
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white text-black hover:bg-light-gray'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Project Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                BC Project Experience *
              </label>
              <textarea
                value={projectExperience}
                onChange={(e) => setProjectExperience(e.target.value)}
                placeholder="Describe the BC projects you've worked on (e.g., market research for a startup, strategy for a nonprofit...)"
                rows={3}
                className="w-full px-4 py-3 bg-white border-3 border-black font-mono
                           focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                Areas of Expertise * (Select up to 3)
              </label>
              <div className="flex flex-wrap gap-2">
                {BC_EXPERTISE_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleExpertise(area)}
                    className={`px-3 py-1.5 border-2 border-black font-mono text-xs transition-all
                      ${areasOfExpertise.includes(area)
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white text-black hover:bg-light-gray'
                      }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-white font-mono text-sm mb-2">
                Availability *
              </label>
              <div className="flex flex-wrap gap-2">
                {BC_AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAvailability(opt)}
                    className={`px-3 py-1.5 border-2 border-black font-mono text-xs transition-all
                      ${availability === opt
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white text-black hover:bg-light-gray'
                      }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-white font-mono text-sm mb-2">Bio *</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell applicants about yourself and what you can offer..."
                rows={3}
                className="w-full px-4 py-3 bg-white border-3 border-black font-mono
                           focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </motion.div>
          </>
        )}

        {/* Error Message */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border-2 border-red-500 text-red-400 font-mono text-sm"
          >
            {submitError}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-dark-gray border-t-3 border-black"
        >
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-4 font-bold font-mono text-lg border-3 border-black
                       flex items-center justify-center gap-2 transition-all
                       ${isFormValid && !isSubmitting
                         ? 'bg-cyan-500 text-black shadow-brutalist hover:shadow-none hover:translate-x-1 hover:translate-y-1'
                         : 'bg-medium-gray text-dark-gray cursor-not-allowed'
                       }`}
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                CREATING PROFILE...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                START MATCHING
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
