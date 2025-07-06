import nodemailer from 'nodemailer';

// Email service configuration
class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  createTransporter() {
    // Check if we have Gmail credentials
    if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('📧 Using Gmail SMTP for email sending');
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Use App Password for Gmail
        }
      });
    }

    // SendGrid SMTP
    if (process.env.EMAIL_SERVICE === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      console.log('📧 Using SendGrid SMTP for email sending');
      return nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }

    // AWS SES
    if (process.env.EMAIL_SERVICE === 'ses' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('📧 Using AWS SES for email sending');
      return nodemailer.createTransporter({
        SES: {
          aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
          }
        }
      });
    }

    // For development/testing - use Ethereal Email (fake SMTP) or console logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Development mode: Using console logging for emails');
      return nodemailer.createTransporter({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }

    // Fallback: throw error if no email service is configured
    throw new Error('No email service configured. Please set EMAIL_SERVICE and corresponding credentials in environment variables.');
  }

  /**
   * Send email verification email with both token link and verification code
   * @param {string} email - Recipient email address
   * @param {string} token - Verification token for URL
   * @param {string} code - 6-digit verification code
   * @param {string} userName - User's name (optional)
   */
  async sendVerificationEmail(email, token, code, userName = '') {
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: {
          name: 'NextMind AI',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@nextmind-ai.com'
        },
        to: email,
        subject: 'Verify Your Email Address - NextMind AI',
        html: this.getVerificationEmailTemplate(email, verificationUrl, code, userName),
        text: this.getVerificationEmailText(email, verificationUrl, code, userName)
      };

      console.log('📧 Attempting to send email to:', email);
      console.log('📧 Using transporter:', this.transporter.options?.service || 'custom');

      const result = await this.transporter.sendMail(mailOptions);
      
      // Log for development
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Verification email sent:');
        console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
        console.log('Verification Code:', code);
        console.log('Verification URL:', verificationUrl);
        
        // In development, also log the email content to console
        console.log('📧 Email content (development only):');
        console.log('Subject:', mailOptions.subject);
        console.log('To:', mailOptions.to);
        console.log('Verification Code:', code);
      } else {
        console.log('📧 Email sent successfully to:', email);
        console.log('📧 Message ID:', result.messageId);
      }

      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null,
        code: process.env.NODE_ENV === 'development' ? code : undefined // Only include code in development
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      // In development, provide fallback mock functionality
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Email sending failed in development, providing mock response');
        return {
          success: true,
          messageId: 'mock-message-id',
          code: code,
          mock: true
        };
      }
      
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * HTML email template for verification
   */
  getVerificationEmailTemplate(email, verificationUrl, code, userName) {
    return `
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
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
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

                <p style="color: #475569; text-align: center; margin: 30px 0;">
                    <strong>Or click the button below to verify automatically:</strong>
                </p>

                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">
                        ✅ Verify Email Address
                    </a>
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
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
                </p>
            </div>
            
            <div class="footer">
                <p>© 2025 NextMind AI. All rights reserved.</p>
                <p>This email was sent to ${email}</p>
                <p>If you have any questions, contact us at support@nextmind-ai.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Plain text email template for verification
   */
  getVerificationEmailText(email, verificationUrl, code, userName) {
    return `
NextMind AI - Email Verification

${userName ? `Hi ${userName}!` : 'Hello!'}

Thank you for signing up with NextMind AI! To complete your registration, please verify your email address.

VERIFICATION CODE: ${code}

You can either:
1. Enter the code above in the verification form
2. Click this link: ${verificationUrl}

Security Information:
- This code expires in 15 minutes
- You have 5 attempts to verify
- If you didn't request this, please ignore this email

Questions? Contact us at support@nextmind-ai.com

© 2025 NextMind AI. All rights reserved.
This email was sent to ${email}
    `;
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email, userName) {
    try {
      const mailOptions = {
        from: {
          name: 'NextMind AI',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@nextmind-ai.com'
        },
        to: email,
        subject: 'Welcome to NextMind AI! 🎉',
        html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 40px 20px; text-align: center; color: white;">
            <h1>🎉 Welcome to NextMind AI!</h1>
          </div>
          <div style="padding: 40px 20px;">
            <h2>Hi ${userName}!</h2>
            <p>Your email has been successfully verified! You're now ready to start creating amazing AI-powered content.</p>
            <p><strong>What you can do now:</strong></p>
            <ul>
              <li>Generate SEO-optimized blog posts</li>
              <li>Create compelling product descriptions</li>
              <li>Design high-converting ad copy</li>
              <li>Craft engaging social media posts</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600;">
                Start Creating Content
              </a>
            </div>
          </div>
        </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('📧 Welcome email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Welcome email failed:', error);
      // Don't throw error for welcome email failure
    }
  }
}

export default new EmailService();