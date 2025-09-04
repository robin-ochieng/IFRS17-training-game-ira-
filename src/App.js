// App.js 
import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import IFRS17TrainingGame from './IFRS17TrainingGame';
import { getCurrentAuthUser, signOut } from './modules/authService';
import { setStorageUser } from './modules/storageService';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  // Check for existing user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = getCurrentAuthUser();
        if (user) {
          setCurrentUser(user);
          setStorageUser(user.id);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Handle successful login from AuthScreen
  const handleLogin = (user) => {
    setCurrentUser(user);
    setStorageUser(user.id);
    setShowAuth(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setShowAuth(true);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle showing auth modal from game
  const handleShowAuth = (mode = 'signin') => {
    setAuthMode(mode);
    setShowAuth(true);
    return Promise.resolve();
  };

  // Loading screen
  if (isLoading) {
    return (
  <div className="min-h-screen flex items-center justify-center bg-black/40">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth screen only if explicitly requested (not for missing currentUser)
  if (showAuth) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // Show game for all users (authenticated or guest will be determined in the game component)
  return (
    <IFRS17TrainingGame 
      currentUser={currentUser}
      onLogout={handleLogout}
      onShowAuth={handleShowAuth}
    />
  );
}

export default App;