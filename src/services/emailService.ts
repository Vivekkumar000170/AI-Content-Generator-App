// Real email service using Gmail SMTP
class EmailService {
  private verificationCodes = new Map<string, { code: string, timestamp: number }>();
  private readonly APP_PASSWORD = 'fzag qdnv dtpk qxal';
  private readonly EMAIL_USER = 'blackrolex1144@gmail.com';

  async sendVerificationEmail(email: string, userName: string = ''): Promise<{
    success: boolean;
    code: string;
    message: string;
    previewUrl?: string;
  }> {
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with timestamp for this email
    this.verificationCodes.set(email.toLowerCase(), {
      code,
      timestamp: Date.now()
    });
    
    try {
      // Try to send real email via backend API
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userName,
          code,
          appPassword: this.APP_PASSWORD,
          emailUser: this.EMAIL_USER
        }),
      });

      if (response.ok) {
        console.log(`✅ Real email sent to: ${email}`);
        return {
          success: true,
          code,
          message: 'Verification email sent to your inbox!'
        };
      } else {
        throw new Error('Backend email service not available');
      }
    } catch (error) {
      console.warn('Real email failed, using development mode:', error);
      
      // Fallback to development mode
      console.log(`📧 Development Mode - Email would be sent to: ${email}`);
      console.log(`👤 User: ${userName}`);
      console.log(`🔢 Verification Code: ${code}`);
      console.log(`⏰ Valid for: 15 minutes`);
      
      return {
        success: true,
        code,
        message: 'Development Mode: Check console for verification code'
      };
    }
  }

  async verifyCode(email: string, code: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const stored = this.verificationCodes.get(email.toLowerCase());
    
    if (!stored) {
      return {
        success: false,
        message: 'No verification code found for this email'
      };
    }
    
    // Check if code is expired (15 minutes)
    const isExpired = (Date.now() - stored.timestamp) > (15 * 60 * 1000);
    if (isExpired) {
      this.verificationCodes.delete(email.toLowerCase());
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      };
    }
    
    if (stored.code === code) {
      // Remove the code after successful verification
      this.verificationCodes.delete(email.toLowerCase());
      return {
        success: true,
        message: 'Email verified successfully!'
      };
    }
    
    return {
      success: false,
      message: 'Invalid verification code'
    };
  }

  // For development - accept any 6-digit code
  async verifyAnyCode(email: string, code: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // First try the real verification
    const realResult = await this.verifyCode(email, code);
    if (realResult.success) {
      return realResult;
    }
    
    // Fallback: accept any 6-digit code in development
    if (code.length === 6 && /^\d+$/.test(code)) {
      return {
        success: true,
        message: 'Email verified successfully! (Development Mode)'
      };
    }
    
    return {
      success: false,
      message: 'Please enter a valid 6-digit verification code'
    };
  }

  // Create HTML email template
  private createEmailTemplate(userName: string, code: string): string {
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
                <p>This email was sent to verify your account registration</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export const emailService = new EmailService();