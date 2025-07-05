import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmailVerification from './EmailVerification';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  redirectTo?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  redirectTo 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify-email'>(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    plan: 'starter'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [mockVerificationCode, setMockVerificationCode] = useState<string>('');

  const { login, register } = useAuth();

  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', plan: 'starter' });
      setError(null);
      setSuccess(null);
      setShowPassword(false);
      setPendingUserData(null);
      setMockVerificationCode('');
    }
  }, [isOpen, mode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  // Mock email verification function for development
  const sendMockVerificationEmail = async (email: string, userName: string) => {
    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    setMockVerificationCode(verificationCode);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 Mock Verification Email Sent to: ${email}`);
    console.log(`🔢 Verification Code: ${verificationCode}`);
    console.log(`👤 User Name: ${userName}`);
    
    return {
      success: true,
      message: 'Verification email sent successfully',
      code: verificationCode // In development, we'll show this
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        setSuccess('Login successful! Welcome back.');
        setTimeout(() => {
          onClose();
          if (redirectTo) {
            const element = document.querySelector(redirectTo);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 1500);
      } else if (mode === 'register') {
        try {
          // Try to send real verification email first
          const response = await fetch('/api/email-verification/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: formData.email,
              userName: formData.name 
            }),
          });

          let data;
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            // If response is not JSON, treat as server error
            throw new Error('Server is not responding properly');
          }

          if (!response.ok) {
            throw new Error(data.error || 'Failed to send verification email');
          }

          setSuccess('Verification email sent! Please check your inbox.');
        } catch (emailError) {
          console.warn('Real email service failed, using mock verification:', emailError);
          
          // Fallback to mock email verification
          const mockResult = await sendMockVerificationEmail(formData.email, formData.name);
          setSuccess('Verification email sent! (Development Mode - Check console for code)');
        }

        // Store user data for after verification
        setPendingUserData({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          plan: formData.plan
        });

        setMode('verify-email');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerified = async (verifiedEmail: string) => {
    if (pendingUserData && pendingUserData.email === verifiedEmail) {
      try {
        setIsLoading(true);
        // Now create the user account
        await register(
          pendingUserData.name, 
          pendingUserData.email, 
          pendingUserData.password, 
          pendingUserData.plan
        );
        
        setSuccess('Account created successfully! Your free trial has started.');
        setTimeout(() => {
          onClose();
          if (redirectTo) {
            const element = document.querySelector(redirectTo);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 1500);
      } catch (error: any) {
        setError(error.message);
        setMode('register'); // Go back to registration form
      } finally {
        setIsLoading(false);
      }
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccess(null);
    setPendingUserData(null);
    setMockVerificationCode('');
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login('demo@example.com', 'password');
      setSuccess('Demo login successful!');
      setTimeout(() => {
        onClose();
        if (redirectTo) {
          const element = document.querySelector(redirectTo);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 1500);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      ></div>
      
      {/* Modal Content with Enhanced Glass Morphism */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-200">
        <div className="bg-gray-900/60 backdrop-blur-3xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
          {/* Email Verification Mode */}
          {mode === 'verify-email' ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Verify Your Email</h3>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-700/30 backdrop-blur-2xl hover:bg-gray-600/30 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10 hover:border-white/20"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-300 hover:text-white" />
                </button>
              </div>
              
              {/* Mock verification for development */}
              <div className="space-y-6">
                {mockVerificationCode && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <h4 className="text-yellow-400 font-medium mb-2">🔧 Development Mode</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      Verification code sent to: <strong>{pendingUserData?.email}</strong>
                    </p>
                    <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <span className="text-gray-400">Code:</span>
                      <span className="font-mono text-yellow-400 text-lg">{mockVerificationCode}</span>
                    </div>
                  </div>
                )}
                
                <EmailVerification
                  email={pendingUserData?.email || ''}
                  mode="verify"
                  onVerificationComplete={handleEmailVerified}
                  onBack={() => setMode('register')}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gray-800/20 backdrop-blur-2xl">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {mode === 'login' ? 'Welcome Back' : 'Start Your Free Trial'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {mode === 'login' 
                      ? 'Sign in to your NextMind AI account' 
                      : '7 days free • Email verification required'
                    }
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-700/30 backdrop-blur-2xl hover:bg-gray-600/30 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10 hover:border-white/20"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-300 hover:text-white" />
                </button>
              </div>
              
              {/* Form */}
              <div className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 backdrop-blur-2xl border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 backdrop-blur-2xl border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-400">{success}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {mode === 'register' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Choose Your Plan
                      </label>
                      <select
                        value={formData.plan}
                        onChange={(e) => handleInputChange('plan', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/30 backdrop-blur-2xl border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white"
                      >
                        <option value="starter">Starter - $9/month (1,000 words)</option>
                        <option value="professional">Professional - $29/month (10,000 words)</option>
                        <option value="enterprise">Enterprise - $99/month (Unlimited)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Start with a 7-day free trial on any plan
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 px-4 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 backdrop-blur-xl border border-white/10"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{mode === 'login' ? 'Signing In...' : 'Sending Verification...'}</span>
                      </div>
                    ) : (
                      mode === 'login' ? 'Sign In' : 'Send Verification Code'
                    )}
                  </button>
                </form>

                {/* Demo Login Button */}
                {mode === 'login' && (
                  <div className="mt-4">
                    <button
                      onClick={handleDemoLogin}
                      disabled={isLoading}
                      className="w-full bg-gray-700/30 backdrop-blur-2xl hover:bg-gray-600/30 py-3 px-4 rounded-lg font-medium text-gray-300 hover:text-white transition-all duration-300 disabled:opacity-50 border border-white/10 hover:scale-105 hover:border-white/20"
                    >
                      Try Demo Account
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Email: demo@example.com • Password: password
                    </p>
                  </div>
                )}

                {/* Switch Mode */}
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <button
                      onClick={switchMode}
                      className="ml-1 text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
                    >
                      {mode === 'login' ? 'Start free trial' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;