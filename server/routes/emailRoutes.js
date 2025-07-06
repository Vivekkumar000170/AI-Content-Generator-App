import express from 'express';
import rateLimit from 'express-rate-limit';
import emailService from '../services/emailService.js';

const router = express.Router();

// Rate limiting for email sending
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 emails per IP per window
  message: {
    error: 'Too many email requests. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  }
});

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map();

// Send verification email endpoint
router.post('/send-verification', emailLimiter, async (req, res) => {
  try {
    const { email, userName } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (15 minutes)
    verificationCodes.set(email.toLowerCase(), {
      code,
      timestamp: Date.now(),
      attempts: 0
    });

    // Email template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - NextMind AI</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
            .header p { color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 40px 20px; }
            .greeting { color: #1e293b; font-size: 20px; font-weight: 600; margin-bottom: 20px; }
            .message { color: #475569; line-height: 1.6; margin-bottom: 30px; font-size: 16px; }
            .verification-code { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border: 2px dashed #3b82f6; border-radius: 12px; padding: 30px 20px; text-align: center; margin: 30px 0; }
            .code-label { color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 15px 0; }
            .code { font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 8px; margin: 15px 0; font-family: 'Courier New', monospace; background: #ffffff; padding: 15px 20px; border-radius: 8px; border: 1px solid #cbd5e1; }
            .code-instruction { color: #64748b; margin: 15px 0 0 0; font-size: 14px; }
            .security-note { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 6px; }
            .security-title { color: #92400e; font-weight: 600; margin: 0 0 10px 0; font-size: 16px; }
            .security-list { color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5; }
            .footer { background-color: #f8fafc; padding: 30px 20px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
            .footer p { margin: 5px 0; }
            .support-link { color: #3b82f6; text-decoration: none; }
            .support-link:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 NextMind AI</h1>
                <p>Verify Your Email Address</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    ${userName ? `Hi ${userName}!` : 'Hello!'}
                </div>
                
                <div class="message">
                    Thank you for signing up with NextMind AI! To complete your registration and start creating amazing AI-powered content, please verify your email address using the code below.
                </div>

                <div class="verification-code">
                    <div class="code-label">Your Verification Code</div>
                    <div class="code">${code}</div>
                    <div class="code-instruction">
                        Enter this code in the verification form to complete your registration
                    </div>
                </div>

                <div class="security-note">
                    <div class="security-title">🔒 Security Information</div>
                    <ul class="security-list">
                        <li>This verification code expires in 15 minutes</li>
                        <li>You have 5 attempts to verify your email</li>
                        <li>If you didn't request this, please ignore this email</li>
                        <li>Never share this code with anyone</li>
                    </ul>
                </div>

                <div class="message">
                    Once verified, you'll have access to our powerful AI content generation tools including SEO blogs, product descriptions, ad copy, and social media posts.
                </div>
            </div>
            
            <div class="footer">
                <p><strong>© 2025 NextMind AI. All rights reserved.</strong></p>
                <p>This email was sent to <strong>${email}</strong></p>
                <p>Need help? Contact us at <a href="mailto:support@nextmind-ai.com" class="support-link">support@nextmind-ai.com</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Email options
    const mailOptions = {
      from: {
        name: 'NextMind AI',
        address: process.env.EMAIL_FROM || 'blackrolex1144@gmail.com'
      },
      to: email,
      subject: '🤖 Verify Your Email Address - NextMind AI',
      html: htmlTemplate,
      text: `
NextMind AI - Email Verification

${userName ? `Hi ${userName}!` : 'Hello!'}

Thank you for signing up with NextMind AI! To complete your registration, please verify your email address.

VERIFICATION CODE: ${code}

Security Information:
- This code expires in 15 minutes
- You have 5 attempts to verify
- If you didn't request this, please ignore this email

Questions? Contact us at support@nextmind-ai.com

© 2025 NextMind AI. All rights reserved.
This email was sent to ${email}
      `
    };

    // Send email using the shared email service
    const result = await emailService.transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', result.messageId);
    console.log('📧 Verification code for', email, ':', code);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully! Check your inbox.',
      messageId: result.messageId,
      email: email
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to send verification email';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check your app password.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Invalid email credentials. Please verify your app password.';
    }
    
    res.status(500).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify email code endpoint
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email and verification code are required'
      });
    }

    const stored = verificationCodes.get(email.toLowerCase());
    
    if (!stored) {
      return res.status(400).json({
        error: 'No verification code found for this email. Please request a new one.'
      });
    }
    
    // Check if code is expired (15 minutes)
    const isExpired = (Date.now() - stored.timestamp) > (15 * 60 * 1000);
    if (isExpired) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new one.'
      });
    }
    
    // Check attempt limit
    if (stored.attempts >= 5) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(429).json({
        error: 'Too many verification attempts. Please request a new code.'
      });
    }
    
    // Increment attempts
    stored.attempts += 1;
    
    if (stored.code === code.trim()) {
      // Remove the code after successful verification
      verificationCodes.delete(email.toLowerCase());
      
      res.json({
        success: true,
        message: 'Email verified successfully!',
        email: email
      });
    } else {
      res.status(400).json({
        error: 'Invalid verification code. Please try again.',
        attemptsRemaining: 5 - stored.attempts
      });
    }

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      error: 'Verification failed. Please try again.'
    });
  }
});

export default router;