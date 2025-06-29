import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Network, Brain, Cpu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
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
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/solutions" 
                className={`transition-colors ${isActive('/solutions') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                Solutions
              </Link>
              <Link 
                to="/features" 
                className={`transition-colors ${isActive('/features') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className={`transition-colors ${isActive('/pricing') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors ${isActive('/about') ? 'text-blue-400' : 'text-gray-300 hover:text-blue-400'}`}
              >
                About
              </Link>
              <Link 
                to="/" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
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
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Network className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Cpu className="w-5 h-5" />
                </div>
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
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
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
    </div>
  );
};

export default Layout;