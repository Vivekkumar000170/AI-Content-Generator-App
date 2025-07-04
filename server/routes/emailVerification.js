import express from 'express';
import rateLimit from 'express-rate-limit';
import EmailVerification from '../models/EmailVerification.js';
import User from '../models/User.js';
import emailService from '../services/emailService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Rate limiting for email verification endpoints
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  message: {
    error: 'Too many verification attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

const resendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 resend attempts per IP per window
  message: {
    error: 'Too many resend attempts. Please wait 5 minutes before requesting another email.',
    retryAfter: 5 * 60
  }
});

/**
 * POST /api/email-verification/send
 * Send verification email to user
 */
router.post('/send', resendLimiter, async (req, res) => {
  try {
    const { email, userId } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Valid email address is required'
      });
    }

    // Check if email is already verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        error: 'Email address is already verified'
      });
    }

    // Clean up any existing verification records for this email
    await EmailVerification.deleteMany({ 
      email: email.toLowerCase(),
      verified: false 
    });

    // Create new verification record
    const verification = new EmailVerification({
      email: email.toLowerCase(),
      userId: userId || null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await verification.save();

    // Get user name if available
    let userName = '';
    if (userId) {
      const user = await User.findById(userId);
      userName = user?.name || '';
    }

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(
      email.toLowerCase(),
      verification.token,
      verification.code,
      userName
    );

    res.json({
      message: 'Verification email sent successfully',
      email: email.toLowerCase(),
      expiresAt: verification.expiresAt,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          code: verification.code,
          token: verification.token,
          previewUrl: emailResult.previewUrl
        }
      })
    });

  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({
      error: 'Failed to send verification email. Please try again.'
    });
  }
});

/**
 * POST /api/email-verification/verify
 * Verify email using token or code
 */
router.post('/verify', verificationLimiter, async (req, res) => {
  try {
    const { token, code, email } = req.body;

    if (!token && !code) {
      return res.status(400).json({
        error: 'Verification token or code is required'
      });
    }

    // Find verification record
    let verification;
    if (token) {
      verification = await EmailVerification.findOne({ 
        token,
        verified: false 
      });
    } else if (code && email) {
      verification = await EmailVerification.findOne({ 
        code,
        email: email.toLowerCase(),
        verified: false 
      });
    }

    if (!verification) {
      return res.status(400).json({
        error: 'Invalid or expired verification token/code'
      });
    }

    // Check if expired
    if (verification.isExpired()) {
      await verification.deleteOne();
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new one.'
      });
    }

    // Check attempt limit
    if (verification.attempts >= 5) {
      await verification.deleteOne();
      return res.status(429).json({
        error: 'Too many verification attempts. Please request a new verification email.'
      });
    }

    // Verify and mark as complete
    await verification.verify();

    // Update user's email verification status if user exists
    if (verification.userId) {
      await User.findByIdAndUpdate(verification.userId, {
        isEmailVerified: true,
        emailVerificationToken: null
      });
    }

    // Send welcome email
    const user = verification.userId ? await User.findById(verification.userId) : null;
    if (user) {
      try {
        await emailService.sendWelcomeEmail(verification.email, user.name);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Continue even if welcome email fails
      }
    }

    // Clean up verification record
    await verification.deleteOne();

    res.json({
      message: 'Email verified successfully!',
      email: verification.email,
      verified: true,
      ...(user && { user: { id: user._id, name: user.name, email: user.email } })
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Verification failed. Please try again.'
    });
  }
});

/**
 * GET /api/email-verification/status/:token
 * Check verification status by token
 */
router.get('/status/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const verification = await EmailVerification.findOne({ token });

    if (!verification) {
      return res.status(404).json({
        error: 'Verification record not found'
      });
    }

    res.json({
      email: verification.email,
      verified: verification.verified,
      expired: verification.isExpired(),
      attempts: verification.attempts,
      maxAttempts: 5,
      expiresAt: verification.expiresAt,
      createdAt: verification.createdAt
    });

  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      error: 'Failed to check verification status'
    });
  }
});

/**
 * POST /api/email-verification/resend
 * Resend verification email
 */
router.post('/resend', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email address is required'
      });
    }

    // Check if email is already verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        error: 'Email address is already verified'
      });
    }

    // Delete existing unverified records
    await EmailVerification.deleteMany({ 
      email: email.toLowerCase(),
      verified: false 
    });

    // Create new verification
    const verification = new EmailVerification({
      email: email.toLowerCase(),
      userId: existingUser?._id || null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await verification.save();

    // Send email
    const emailResult = await emailService.sendVerificationEmail(
      email.toLowerCase(),
      verification.token,
      verification.code,
      existingUser?.name || ''
    );

    res.json({
      message: 'Verification email resent successfully',
      email: email.toLowerCase(),
      expiresAt: verification.expiresAt
    });

  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      error: 'Failed to resend verification email'
    });
  }
});

/**
 * DELETE /api/email-verification/cleanup
 * Admin endpoint to clean up expired verification records
 */
router.delete('/cleanup', authenticate, async (req, res) => {
  try {
    // Only allow admin users or system cleanup
    if (req.user.plan !== 'enterprise') {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const result = await EmailVerification.cleanupExpired();
    
    res.json({
      message: 'Cleanup completed',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup failed'
    });
  }
});

export default router;