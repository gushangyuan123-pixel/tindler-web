import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Heart, User } from 'lucide-react';
import { Badge } from './ui/Badge';

interface TabBarProps {
  matchCount?: number;
  chatCount?: number;
}

export function TabBar({ matchCount = 0, chatCount = 0 }: TabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/discover', icon: Flame, label: 'Discover' },
    { path: '/matches', icon: Heart, label: 'Matches', badge: matchCount + chatCount },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-gray border-t border-medium-gray/30 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors relative
                ${isActive ? 'text-acid-yellow' : 'text-medium-gray'}
              `}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {badge && badge > 0 && (
                  <Badge
                    variant="count"
                    count={badge}
                    className="absolute -top-2 -right-3"
                  />
                )}
              </div>
              <span className="text-[10px] font-mono mt-1 uppercase">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
