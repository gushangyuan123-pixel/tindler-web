import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  Coffee,
  CheckCircle,
  Clock,
  ArrowLeft,
  Shield
} from 'lucide-react';
import bcApiService from '../../services/bcApi';

interface AdminStats {
  total_members: number;
  pending_members: number;
  total_applicants: number;
  total_matches: number;
  pending_matches: number;
  confirmed_matches: number;
  completed_matches: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await bcApiService.getAdminStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load stats');
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

  if (error) {
    return (
      <div className="min-h-screen bg-dark-gray flex flex-col items-center justify-center p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-cyan-500 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Pending BC Members',
      description: `${stats?.pending_members || 0} awaiting approval`,
      icon: Clock,
      path: '/admin/pending-members',
      color: 'bg-yellow-500',
      urgent: (stats?.pending_members || 0) > 0,
    },
    {
      title: 'All BC Members',
      description: `${stats?.total_members || 0} approved members`,
      icon: UserCheck,
      path: '/admin/members',
      color: 'bg-green-500',
    },
    {
      title: 'Add BC Member',
      description: 'Manually create a member',
      icon: UserPlus,
      path: '/admin/add-member',
      color: 'bg-cyan-500',
    },
    {
      title: 'All Applicants',
      description: `${stats?.total_applicants || 0} total applicants`,
      icon: Users,
      path: '/admin/applicants',
      color: 'bg-purple-500',
    },
    {
      title: 'Coffee Chat Matches',
      description: `${stats?.pending_matches || 0} pending, ${stats?.confirmed_matches || 0} confirmed`,
      icon: Coffee,
      path: '/admin/matches',
      color: 'bg-teal-500',
      urgent: (stats?.pending_matches || 0) > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-dark-gray">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-black text-white">ADMIN PANEL</h1>
          </div>
        </div>
        <p className="text-medium-gray text-sm">
          IceLatte X Berkeley Consulting Management
        </p>
      </div>

      {/* Stats Overview */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-800/50 rounded-xl p-4"
          >
            <p className="text-medium-gray text-xs mb-1">Total Matches</p>
            <p className="text-3xl font-black text-white">{stats?.total_matches || 0}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-800/50 rounded-xl p-4"
          >
            <p className="text-medium-gray text-xs mb-1">Completed Chats</p>
            <p className="text-3xl font-black text-green-500">{stats?.completed_matches || 0}</p>
          </motion.div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(item.path)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all
                         hover:scale-[1.02] active:scale-[0.98]
                         ${item.urgent
                           ? 'border-yellow-500 bg-yellow-500/10'
                           : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-medium-gray">{item.description}</p>
                </div>
                {item.urgent && (
                  <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                    ACTION
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
