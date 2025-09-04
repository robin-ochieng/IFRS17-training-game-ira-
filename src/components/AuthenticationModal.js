// src/components/AuthenticationModal.js
import React from 'react';
import { X, LogIn, UserPlus, Trophy, Star, Zap } from 'lucide-react';

const AuthenticationModal = ({ 
  isOpen, 
  onClose, 
  onSignIn, 
  onSignUp, 
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl max-w-md w-full p-8 border border-purple-500/30 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mb-6">
              <img
                src="/IRA logo.png"
                alt="IRA Logo"
                className="hidden md:block w-16 h-16 object-contain mx-auto mb-4"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            <h2 className="text-3xl font-bold text-white mb-2">
              Unlock All Modules! 🎮
            </h2>
            <p className="text-gray-300">
              Great job completing Module 1! Sign up to continue to Module 2 and save your progress.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-3">With an account you get:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>Access to all 9 training modules</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>Compete on global leaderboard</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Zap className="w-4 h-4 text-blue-400" />
                <span>Track achievements & progress</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Star className="w-4 h-4 text-green-400" />
                <span>Sync progress across devices</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onSignUp}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up for Free
            </button>
            
            <button
              onClick={onSignIn}
              disabled={isLoading}
              className="w-full text-white subpixel-antialiased bg-black/60 hover:bg-black/70 border border-white/30 hover:border-white/50 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <LogIn className="w-5 h-5" strokeWidth={2.2} />
              Already have an account? Sign In
            </button>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full text-gray-400 hover:text-white transition-colors py-2 disabled:opacity-50"
            >
              Remind Me Later (Module 2 stays locked)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationModal;