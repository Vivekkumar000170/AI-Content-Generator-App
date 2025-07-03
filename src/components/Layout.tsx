import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Network, Brain, Cpu, Menu, X } from 'lucide-react';
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
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // User is already logged in, scroll to content generator
      const element = document.getElementById('content-generator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Show signup modal
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
    }
  };

  const handleSignIn = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Enhanced Animated Background with Glass Effect */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-3xl"></div>
        
        {/* Radial gradients for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.15),transparent_50%)]"></div>
        
        {/* Floating glass orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse backdrop-blur-xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000 backdrop-blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-2000 backdrop-blur-xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header with Glass Effect */}
      <header className="relative z-10 bg-gray-900/40 backdrop-blur-2xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <Bot className="w-8 h-8 text-white" />
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
                className={`transition-all duration-300 hover:scale-105 ${isActive('/solutions') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                Solutions
              </Link>
              <Link 
                to="/features" 
                className={`transition-all duration-300 hover:scale-105 ${isActive('/features') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`transition-all duration-300 hover:scale-105 ${isActive('/pricing') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className={`transition-all duration-300 hover:scale-105 ${isActive('/about') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                About
              </Link>
              
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-xl hover:bg-gray-700/50 px-4 py-2 rounded-xl border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-300">{user?.name}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 z-50">
                      <UserDashboard />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSignIn}
                    className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-105"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 backdrop-blur-xl"
                  >
                    Start Free Trial
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white bg-gray-800/50 backdrop-blur-xl rounded-lg border border-white/10 transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 bg-gray-800/30 backdrop-blur-xl rounded-xl">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/solutions" 
                  className={`transition-colors ${isActive('/solutions') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link 
                  to="/features" 
                  className={`transition-colors ${isActive('/features') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing" 
                  className={`transition-colors ${isActive('/pricing') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-colors ${isActive('/about') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                
                {/* Mobile Auth Buttons */}
                {isAuthenticated ? (
                  <div className="pt-4 border-t border-white/10">
                    <UserDashboard />
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        handleSignIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-left text-gray-300 hover:text-blue-400 transition-colors p-2"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        handleGetStarted();
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all text-center backdrop-blur-xl"
                    >
                      Start Free Trial
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer with Glass Effect */}
      <footer className="relative z-10 bg-gray-900/40 backdrop-blur-2xl border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
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
                <button className="w-10 h-10 bg-gray-800/50 backdrop-blur-xl rounded-lg flex items-center justify-center hover:bg-blue-600/50 transition-all duration-300 border border-white/10 hover:scale-110">
                  <Network className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-800/50 backdrop-blur-xl rounded-lg flex items-center justify-center hover:bg-blue-600/50 transition-all duration-300 border border-white/10 hover:scale-110">
                  <Brain className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-gray-800/50 backdrop-blur-xl rounded-lg flex items-center justify-center hover:bg-blue-600/50 transition-all duration-300 border border-white/10 hover:scale-110">
                  <Cpu className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Solutions</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors">SEO Content</Link></li>
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors">Product Descriptions</Link></li>
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors">Ad Copy</Link></li>
                <li><Link to="/solutions" className="hover:text-blue-400 transition-colors">Social Media</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Careers</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                <li><Link to="/about" className="hover:text-blue-400 transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 NextMind AI. All rights reserved. Powered by advanced AI technology.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default Layout;