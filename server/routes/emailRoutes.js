import express from 'express';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

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

// Send verification email endpoint
router.post('/send-verification', emailLimiter, async (req, res) => {
  try {
    const { email, userName, code, appPassword, emailUser } = req.body;

    if (!email || !code || !appPassword || !emailUser) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Create Gmail transporter with app password
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: appPassword
      }
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
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 20px; }
            .verification-code { background-color: #f1f5f9; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0; }
            .code { font-size: 32px; font-weight: bold; color: #1e293b; letter-spacing: 4px; margin: 10px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .security-note { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 NextMind AI</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0;">Verify Your Email Address</p>
            </div>
            
            <div class="content">
                <h2 style="color: #1e293b; margin-bottom: 20px;">
                    ${userName ? `Hi ${userName}!` : 'Hello!'}
                </h2>
                
                <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for signing up with NextMind AI! To complete your registration and start creating amazing AI-powered content, please verify your email address.
                </p>

                <div class="verification-code">
                    <h3 style="color: #1e293b; margin: 0 0 10px 0;">Your Verification Code</h3>
                    <div class="code">${code}</div>
                    <p style="color: #64748b; margin: 10px 0 0 0; font-size: 14px;">
                        Enter this code in the verification form
                    </p>
                </div>

                <div class="security-note">
                    <h4 style="color: #92400e; margin: 0 0 8px 0;">🔒 Security Information</h4>
                    <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
                        <li>This verification code expires in 15 minutes</li>
                        <li>You have 5 attempts to verify your email</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>

                <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                    If you have any questions, contact us at support@nextmind-ai.com
                </p>
            </div>
            
            <div class="footer">
                <p>© 2025 NextMind AI. All rights reserved.</p>
                <p>This email was sent to ${email}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Email options
    const mailOptions = {
      from: {
        name: 'NextMind AI',
        address: emailUser
      },
      to: email,
      subject: 'Verify Your Email Address - NextMind AI',
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

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', result.messageId);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      messageId: result.messageId
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

export default router;