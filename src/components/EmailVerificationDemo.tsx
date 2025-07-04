import React, { useState } from 'react';
import { Mail, Code, CheckCircle, AlertCircle } from 'lucide-react';
import EmailVerification from './EmailVerification';

const EmailVerificationDemo = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [demoEmail, setDemoEmail] = useState('demo@example.com');

  const handleDemoComplete = (email: string) => {
    console.log('Demo verification completed for:', email);
    setShowDemo(false);
  };

  if (showDemo) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative">
          <EmailVerification
            email={demoEmail}
            onVerificationComplete={handleDemoComplete}
            onBack={() => setShowDemo(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Secure Email
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Verification System
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Protect your users with our robust email verification system featuring secure tokens, 
            rate limiting, and beautiful user experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Email Delivery</h3>
            <p className="text-gray-400">
              Professional HTML emails with fallback text versions. Supports Gmail, SendGrid, AWS SES, and more.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Secure Tokens</h3>
            <p className="text-gray-400">
              Cryptographically secure tokens and 6-digit codes with expiration times and attempt limits.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Rate Protection</h3>
            <p className="text-gray-400">
              Built-in rate limiting and abuse prevention to protect against spam and malicious attempts.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-3xl p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Try the Demo</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience our email verification system in action. In development mode, 
            you'll see debug information including the verification code.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <input
              type="email"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              placeholder="Enter email for demo"
              className="px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white placeholder-gray-400"
            />
            <button
              onClick={() => setShowDemo(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
            >
              Launch Demo
            </button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-yellow-400 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Development Mode</span>
            </div>
            <p className="text-yellow-300 text-sm">
              In demo mode, verification codes are displayed for testing. 
              Real emails are sent in production.
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-white mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Technical Implementation
            </span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 rounded-2xl p-8">
              <h4 className="text-lg font-semibold text-white mb-4">Backend Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li>• Secure token generation with crypto.randomBytes()</li>
                <li>• MongoDB schema with TTL indexes for auto-cleanup</li>
                <li>• Rate limiting with express-rate-limit</li>
                <li>• Multiple email service provider support</li>
                <li>• Comprehensive error handling and logging</li>
                <li>• RESTful API endpoints with proper validation</li>
              </ul>
            </div>
            
            <div className="bg-gray-800/30 rounded-2xl p-8">
              <h4 className="text-lg font-semibold text-white mb-4">Frontend Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li>• React component with TypeScript</li>
                <li>• Real-time countdown timer</li>
                <li>• Automatic token verification from URLs</li>
                <li>• Responsive design with Tailwind CSS</li>
                <li>• Loading states and error handling</li>
                <li>• Development debug information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailVerificationDemo;