import React from 'react';
import { FaBrain, FaRocket } from 'react-icons/fa';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center loading-screen">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl animate-pulse flex items-center justify-center shadow-lg transform rotate-3">
            <FaBrain className="text-white text-3xl animate-bounce" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4 animate-fade-in">
          Prompt Your Future
        </h2>
        
        <div className="flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <p className="text-slate-300 mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Loading your future...
        </p>
        
        <div className="mt-6">
          <FaRocket className="text-white text-xl animate-float mx-auto" />
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;