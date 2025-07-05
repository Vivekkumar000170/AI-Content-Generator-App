// Mock email service for development
class MockEmailService {
  private verificationCodes = new Map<string, string>();

  async sendVerificationEmail(email: string, userName: string = ''): Promise<{
    success: boolean;
    code: string;
    message: string;
  }> {
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code for this email
    this.verificationCodes.set(email.toLowerCase(), code);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 Mock Email Sent to: ${email}`);
    console.log(`👤 User: ${userName}`);
    console.log(`🔢 Verification Code: ${code}`);
    console.log(`⏰ Valid for: 15 minutes`);
    
    return {
      success: true,
      code,
      message: 'Verification email sent successfully'
    };
  }

  async verifyCode(email: string, code: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const storedCode = this.verificationCodes.get(email.toLowerCase());
    
    if (!storedCode) {
      return {
        success: false,
        message: 'No verification code found for this email'
      };
    }
    
    if (storedCode === code) {
      // Remove the code after successful verification
      this.verificationCodes.delete(email.toLowerCase());
      return {
        success: true,
        message: 'Email verified successfully'
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
    if (code.length === 6 && /^\d+$/.test(code)) {
      return {
        success: true,
        message: 'Email verified successfully (Development Mode)'
      };
    }
    
    return {
      success: false,
      message: 'Please enter a valid 6-digit code'
    };
  }
}

export const emailService = new MockEmailService();