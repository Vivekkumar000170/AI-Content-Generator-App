import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { emailService } from '../services/emailService';

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
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes

  const { login, register } = useAuth();

  // Countdown timer
  React.useEffect(() => {
    if (mode === 'verify-email' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [mode, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      setVerificationCode('');
      setError(null);
      setSuccess(null);
      setShowPassword(false);
      setPendingUserData(null);
      setTimeLeft(900);
    }
  }, [isOpen, mode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📧 Sending verification email to:', formData.email);
      const result = await emailService.sendVerificationEmail(formData.email, formData.name);
      
      if (result.success) {
        setSuccess('Verification email sent! Check your inbox and spam folder.');
        
        // Store user data for after verification
        setPendingUserData({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          plan: formData.plan
        });

        setMode('verify-email');
        setTimeLeft(900); // Reset timer
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error('Verification email error:', error);
      setError('Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Verifying code:', verificationCode);
      const result = await emailService.verifyCode(formData.email, verificationCode);
      
      if (result.success && pendingUserData) {
        // Create the user account
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
      } else {
        setError(result.message || 'Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (pendingUserData) {
      setIsLoading(true);
      try {
        const result = await emailService.sendVerificationEmail(pendingUserData.email, pendingUserData.name);
        if (result.success) {
          setSuccess('New verification code sent! Check your inbox.');
          setTimeLeft(900);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError('Failed to resend code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
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
        await handleSendVerification();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccess(null);
    setPendingUserData(null);
    setVerificationCode('');
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
              
              <div className="space-y-6">
                {/* Email Sent Notice */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-blue-400 font-medium mb-2">📧 Email Sent!</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    Verification code sent to: <strong>{pendingUserData?.email}</strong>
                  </p>
                  <p className="text-xs text-gray-400">
                    Check your email inbox and spam folder for the 6-digit code.
                  </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 bg-red-500/10 backdrop-blur-2xl border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-500/10 backdrop-blur-2xl border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-400">{success}</p>
                    </div>
                  </div>
                )}

                {/* Verification Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 px-4 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Create Account</span>
                    </>
                  )}
                </button>

                {/* Timer and Resend */}
                <div className="text-center">
                  {timeLeft > 0 ? (
                    <p className="text-gray-400 text-sm mb-2">
                      Code expires in <span className="font-mono text-blue-400">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mb-2">Code has expired</p>
                  )}
                  
                  <button
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Resend verification code
                  </button>
                </div>

                {/* Back Button */}
                <button
                  onClick={() => setMode('register')}
                  className="w-full bg-gray-700/30 backdrop-blur-2xl hover:bg-gray-600/30 py-2 px-4 rounded-lg font-medium text-gray-300 hover:text-white transition-all duration-300 border border-white/10"
                >
                  ← Back to Registration
                </button>
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