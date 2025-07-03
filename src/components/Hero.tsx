import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Zap, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VideoModal from './VideoModal';
import AuthModal from './AuthModal';

const Hero = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartCreating = () => {
    if (isAuthenticated) {
      // User is logged in, scroll to content generator
      const element = document.getElementById('content-generator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Show signup modal for free trial
      setIsAuthModalOpen(true);
    }
  };

  const handleWatchDemo = () => {
    setIsVideoModalOpen(true);
  };

  return (
    <>
      <section className="relative z-10 pt-20 pb-32" id="hero">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">AI-Powered Content Generation</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                AI-Driven solutions for a
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                smarter tomorrow
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform your content strategy with our cutting-edge AI technology. 
              Generate high-quality blogs, product descriptions, ad copy, and social media posts 
              that engage your audience and drive results.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button 
                onClick={handleStartCreating}
                className="group bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2 hover:scale-105 backdrop-blur-xl border border-white/10"
              >
                <span>{isAuthenticated ? 'Start Creating' : 'Start Free Trial'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={handleWatchDemo}
                className="group bg-gray-800/30 border border-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-700/30 transition-all duration-300 flex items-center space-x-2 hover:scale-105 backdrop-blur-xl hover:border-white/20"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  100K+
                </div>
                <div className="text-gray-400 text-sm">Content Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <div className="text-gray-400 text-sm">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <div className="text-gray-400 text-sm">AI Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-bounce delay-1000"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-bounce delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-green-500/20 rounded-full blur-xl animate-bounce"></div>
      </section>

      {/* Video Modal */}
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
        redirectTo="#content-generator"
      />
    </>
  );
};

export default Hero;