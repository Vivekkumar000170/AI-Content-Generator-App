import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import EmailVerification from '../components/EmailVerification';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (token) {
      // Auto-verify with token
      verifyWithToken(token);
    } else if (emailParam) {
      // Show manual verification form with pre-filled email
      setEmail(emailParam);
      setStatus('manual');
    } else {
      // Show manual verification form
      setStatus('manual');
    }
  }, [token, emailParam]);

  const verifyWithToken = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/email-verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setEmail(data.email);
        setMessage('Your email has been successfully verified!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleVerificationComplete = (verifiedEmail: string) => {
    setStatus('success');
    setEmail(verifiedEmail);
    setMessage('Email verified successfully!');
    
    // Redirect to login or dashboard after 3 seconds
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 3000);
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Verifying your email...</h2>
          <p className="text-gray-400">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Email Verified!</h1>
          <p className="text-gray-400 mb-6">
            {message}
            {email && (
              <>
                <br />
                <strong className="text-white">{email}</strong> is now verified.
              </>
            )}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You will be redirected to the homepage in a few seconds...
          </p>
          <button
            onClick={handleBackToHome}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 px-4 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            Continue to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
          <p className="text-gray-400 mb-6">{message}</p>
          <div className="space-y-3">
            <button
              onClick={() => setStatus('manual')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 px-4 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Try Manual Verification
            </button>
            <button
              onClick={handleBackToHome}
              className="w-full bg-gray-700 hover:bg-gray-600 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manual verification mode
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EmailVerification
          email={email}
          mode="verify"
          onVerificationComplete={handleVerificationComplete}
          onBack={handleBackToHome}
        />
      </div>
    </div>
  );
};

export default VerifyEmail;