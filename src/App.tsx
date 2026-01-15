import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Pages
import { Login } from './pages/Login';
import { OnboardingFlow } from './pages/Onboarding';
import { ProfileSelection } from './pages/ProfileSelection';
import { Discover } from './pages/Discover';
import { Matches } from './pages/Matches';
import { Chat } from './pages/Chat';
import { Profile } from './pages/Profile';

// Components
import { TabBar } from './components/TabBar';

function AppRoutes() {
  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth();
  const { isOnboarded, hasSelectedProfile, matches, chatsCount } = useApp();
  const location = useLocation();

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-gray flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-acid-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onSuccess={signIn} />;
  }

  // Determine which screen to show based on state
  const showOnboarding = !isOnboarded;
  const showProfileSelection = isOnboarded && !hasSelectedProfile;
  const showMainApp = isOnboarded && hasSelectedProfile;

  // Hide tab bar on chat and onboarding screens
  const hideTabBar = location.pathname.startsWith('/chat') || showOnboarding || showProfileSelection;

  return (
    <div className="min-h-screen bg-dark-gray">
      <AnimatePresence mode="wait">
        {showOnboarding && (
          <OnboardingFlow
            key="onboarding"
            onComplete={() => {}}
          />
        )}

        {showProfileSelection && (
          <ProfileSelection
            key="profile-selection"
            onComplete={() => {}}
          />
        )}

        {showMainApp && (
          <>
            <Routes>
              <Route path="/" element={<Navigate to="/discover" replace />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chat/:matchId" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/discover" replace />} />
            </Routes>

            {!hideTabBar && (
              <TabBar
                matchCount={matches.filter(m => !m.lastMessage).length}
                chatCount={chatsCount}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
