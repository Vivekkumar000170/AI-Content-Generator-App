import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Network, Brain, Cpu, Menu, X, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserDashboard from './UserDashboard';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Scroll to content generator
      const element = document.getElementById('content-generator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleUserMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header with Glass Morphism */}
      <header className="relative z-50 bg-gray-900/60 backdrop-blur-3xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg backdrop-blur-xl overflow-hidden">
                  <img 
                    src="/ChatGPT Image Jul 6, 2025, 12_52_33 AM.png" 
                    alt="NextMind AI Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NextMind AI
                </h1>
                <p className="text-gray-400 text-sm">AI-Driven Content Solutions</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/solutions" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/solutions') 
                    ? 'text-blue-400 font-medium' 
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Solutions
              </Link>
              <Link 
                to="/features" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/features') 
                    ? 'text-blue-400 font-medium' 
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/pricing') 
                    ? 'text-blue-400 font-medium' 
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className={`transition-all duration-300 hover:scale-105 ${
                  isActive('/about') 
                    ? 'text-blue-400 font-medium' 
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                About
              </Link>
              
              {/* User Menu or Get Started Button */}
              {isAuthenticated ? (
                <div className="relative z-50" ref={userMenuRef}>
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-2xl border border-white/10 px-4 py-2 rounded-lg hover:bg-gray-700/30 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-300">{user?.name}</span>
                  </button>
                  
                  {/* User Dropdown with Maximum Z-Index */}
                  {isUserMenuOpen && (
                    <>
                      {/* Dark blur backdrop with very high z-index */}
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"></div>
                      
                      {/* Dropdown menu with maximum z-index */}
                      <div className="absolute right-0 top-full mt-2 z-[9999]">
                        <UserDashboard />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-xl border border-white/10"
                >
                  Get Started
                </button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg hover:bg-gray-700/30 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 p-4 bg-gray-800/30 backdrop-blur-3xl border border-white/10 rounded-xl">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/solutions" 
                  className={`transition-colors ${
                    isActive('/solutions') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link 
                  to="/features" 
                  className={`transition-colors ${
                    isActive('/features') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing" 
                  className={`transition-colors ${
                    isActive('/pricing') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-colors ${
                    isActive('/about') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-white/10">
                    <UserDashboard />
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-center"
                  >
                    Get Started
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Enhanced Footer with Glass Morphism */}
      <footer className="relative z-10 bg-gray-900/60 backdrop-blur-3xl border-t border-white/10 mt-20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg backdrop-blur-xl overflow-hidden">
                  <img 
                    src="/ChatGPT Image Jul 6, 2025, 12_52_33 AM.png" 
                    alt="NextMind AI Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NextMind AI
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Empowering businesses with cutting-edge AI technology to create compelling content 
                that drives engagement and delivers measurable results.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-110">
                  <Network className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-110">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-110">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Solutions</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors hover:underline">SEO Content</Link></li>
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors hover:underline">Product Descriptions</Link></li>
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors hover:underline">Ad Copy</Link></li>
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors hover:underline">Social Media</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/about" className="hover:text-blue-400 transition-colors hover:underline">About Us</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors hover:underline">Careers</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors hover:underline">Contact</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors hover:underline">Support</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Newsletter Subscription Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Stay Updated with NextMind AI</h3>
              <p className="text-gray-400 mb-6">
                Get the latest AI insights, product updates, and exclusive content delivered to your inbox. 
                Join thousands of professionals already subscribed.
              </p>
              
              <NewsletterSubscription />
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 NextMind AI. All rights reserved. Powered by advanced AI technology.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors hover:underline">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
};

// Newsletter Subscription Component
const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    
    if (!consent) {
      setMessage({ type: 'error', text: 'Please agree to receive our newsletter.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Simulate API call for newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: 'success', 
        text: 'Thank you for subscribing! Check your email for confirmation.' 
      });
      setEmail('');
      setConsent(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to subscribe. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Subscribing...</span>
              </div>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
        
        <div className="flex items-start space-x-3 text-left">
          <input
            type="checkbox"
            id="newsletter-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            required
          />
          <label htmlFor="newsletter-consent" className="text-xs text-gray-400 leading-relaxed">
            I agree to receive newsletters, product updates, and promotional emails from NextMind AI. 
            You can unsubscribe at any time. By subscribing, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">Privacy Policy</a> and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a>.
          </label>
        </div>
      </form>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        🔒 Your email is secure and will never be shared with third parties.
      </div>
    </div>
  );
};

export default Layout;