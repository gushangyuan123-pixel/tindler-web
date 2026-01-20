import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import bcApiService from '../../services/bcApi';

const YEAR_OPTIONS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const EXPERTISE_OPTIONS = [
  'Strategy', 'Operations', 'Technology', 'Marketing', 'Finance',
  'Healthcare', 'Social Impact', 'Sustainability', 'Product Management', 'Data Analytics'
];
const AVAILABILITY_OPTIONS = [
  'Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Weekends', 'Flexible'
];

export function AdminAddMember() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    photo_url: '',
    year: '',
    major: '',
    semesters_in_bc: 1,
    areas_of_expertise: [] as string[],
    availability: '',
    bio: '',
    project_experience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.year || !formData.major) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await bcApiService.adminCreateMember(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create member');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpertise = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.includes(area)
        ? prev.areas_of_expertise.filter(a => a !== area)
        : [...prev.areas_of_expertise, area]
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-black text-white mb-2">Member Created!</h2>
        <p className="text-medium-gray">Redirecting to admin dashboard...</p>
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
            <h1 className="text-xl font-black text-white">ADD BC MEMBER</h1>
            <p className="text-medium-gray text-sm">Manually create a new BC member</p>
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

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="member@berkeley.edu"
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Full Name"
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Photo URL</label>
          <input
            type="url"
            value={formData.photo_url}
            onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
            placeholder="https://..."
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Year <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {YEAR_OPTIONS.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setFormData({ ...formData, year })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                           ${formData.year === year
                             ? 'bg-cyan-500 text-black'
                             : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Major */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">
            Major <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            placeholder="e.g., Business Administration"
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Semesters in BC */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Semesters in BC</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.semesters_in_bc}
            onChange={(e) => setFormData({ ...formData, semesters_in_bc: parseInt(e.target.value) || 1 })}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Areas of Expertise */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Areas of Expertise</label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_OPTIONS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleExpertise(area)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${formData.areas_of_expertise.includes(area)
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
            {AVAILABILITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData({ ...formData, availability: opt })}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                           ${formData.availability === opt
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
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Brief bio about the member..."
            rows={3}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Project Experience */}
        <div>
          <label className="block text-sm font-bold text-white mb-2">Project Experience</label>
          <textarea
            value={formData.project_experience}
            onChange={(e) => setFormData({ ...formData, project_experience: e.target.value })}
            placeholder="BC project experience..."
            rows={3}
            className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white
                     placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-cyan-500 text-black font-black text-lg rounded-lg
                   hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              CREATE BC MEMBER
            </>
          )}
        </button>
      </form>
    </div>
  );
}
