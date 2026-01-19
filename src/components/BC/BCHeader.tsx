import React, { useState } from 'react';
import { ArrowLeft, Coffee, Users, LogOut, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBC } from '../../context/BCContext';

interface BCHeaderProps {
  showBack?: boolean;
  title?: string;
  rightAction?: React.ReactNode;
  showMenu?: boolean;
}

export function BCHeader({ showBack = true, title, rightAction, showMenu = true }: BCHeaderProps) {
  const navigate = useNavigate();
  const { userType, memberMatches, resetBCState } = useBC();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    resetBCState();
    navigate('/bc');
  };

  return (
    <div className="sticky top-0 z-10 bg-dark-gray border-b-3 border-black">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Back button or spacer */}
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 hover:bg-medium-gray/20 rounded"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="w-10" />
        )}

        {/* Center: Title and role badge */}
        <div className="text-center flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500 text-black font-mono font-bold text-xs tracking-wider">
            <Coffee className="w-3 h-3" />
            BERKELEY CONSULTING
          </div>
          {title && (
            <h1 className="text-white font-bold mt-1">{title}</h1>
          )}
          {userType && (
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-mono tracking-wider
              ${userType === 'applicant'
                ? 'bg-white text-black'
                : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500'
              }`}
            >
              {userType === 'applicant' ? 'APPLICANT' : 'BC MEMBER'}
            </span>
          )}
        </div>

        {/* Right: Action, matches indicator, or menu */}
        <div className="relative">
          {rightAction ? (
            rightAction
          ) : userType === 'bc_member' && memberMatches.length > 0 ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/bc/matches')}
                className="p-2 hover:bg-medium-gray/20 rounded relative"
              >
                <Users className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-black text-xs font-bold
                               flex items-center justify-center border border-black">
                  {memberMatches.length}
                </span>
              </button>
              {showMenu && (
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-2 hover:bg-medium-gray/20 rounded"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          ) : showMenu && userType ? (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-medium-gray/20 rounded"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border-2 border-black shadow-brutalist min-w-[160px]">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-light-gray text-left font-mono text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Switch Role / Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
