import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Pencil,
  Check,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export function Profile() {
  const { currentUser, matches, likesCount, chatsCount } = useApp();
  const { signOut } = useAuth();

  const [stats, setStats] = useState({
    matches: matches.length,
    likes: likesCount,
    chats: chatsCount,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.getStats();
      if (response.success) {
        setStats({
          matches: response.stats.matchesCount,
          likes: response.stats.likesCount,
          chats: chatsCount,
        });
      }
    } catch (err) {
      // Use local state as fallback
      setStats({
        matches: matches.length,
        likes: likesCount,
        chats: chatsCount,
      });
    }
  };

  const menuItems = [
    { icon: Pencil, label: 'Edit Profile', action: () => {} },
    { icon: Settings, label: 'Preferences', action: () => {} },
    { icon: Bell, label: 'Notifications', action: () => {} },
    { icon: Shield, label: 'Privacy', action: () => {} },
    { icon: HelpCircle, label: 'Help & Support', action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-dark-gray pb-20 safe-top">
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-xl font-black text-white">PROFILE</h1>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-6"
      >
        <div className="flex flex-col items-center py-6">
          {/* Avatar with edit button */}
          <div className="relative mb-4">
            <Avatar
              src={currentUser?.photoUrl}
              alt={currentUser?.name}
              size="xl"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-acid-yellow rounded-full flex items-center justify-center shadow-brutalist-sm">
              <Pencil size={16} className="text-black" />
            </button>
          </div>

          {/* Name */}
          <h2 className="text-2xl font-black text-white mb-1">
            {currentUser?.name || 'Guest User'}
          </h2>

          {/* Role */}
          <p className="text-xs font-mono text-medium-gray uppercase mb-3">
            {currentUser?.role || 'Member'} @ {currentUser?.company || 'Tindler'}
          </p>

          {/* Verified badge */}
          {currentUser?.isVerified && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-acid-yellow/20 rounded-lg">
              <Check size={14} className="text-acid-yellow" strokeWidth={3} />
              <span className="text-xs font-mono text-acid-yellow">
                BMOE 2026
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-8"
      >
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={stats.matches} label="Matches" />
          <StatCard value={stats.likes} label="Likes Sent" />
          <StatCard value={stats.chats} label="Chats" />
        </div>
      </motion.div>

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-6"
      >
        <div className="space-y-1">
          {menuItems.map(({ icon: Icon, label, action }) => (
            <MenuItem
              key={label}
              icon={<Icon size={18} />}
              label={label}
              onClick={action}
            />
          ))}

          <div className="h-px bg-medium-gray/30 my-4" />

          <MenuItem
            icon={<LogOut size={18} />}
            label="Log Out"
            onClick={signOut}
            variant="danger"
          />
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <Card variant="dark" padding="md" shadow={false} className="text-center">
      <p className="text-2xl font-black text-acid-yellow mb-1">{value}</p>
      <p className="text-[10px] font-mono text-light-gray uppercase">{label}</p>
    </Card>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function MenuItem({ icon, label, onClick, variant = 'default' }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-4 py-4 rounded-lg
        transition-colors hover:bg-white/5
        ${variant === 'danger' ? 'text-hot-pink' : 'text-white'}
      `}
    >
      <span className={variant === 'danger' ? 'text-hot-pink' : 'text-light-gray'}>
        {icon}
      </span>
      <span className="flex-1 text-left font-semibold">{label}</span>
      {variant !== 'danger' && (
        <ChevronRight size={18} className="text-medium-gray" />
      )}
    </button>
  );
}
