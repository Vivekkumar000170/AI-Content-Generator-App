import express from 'express';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import Admin from '../../models/Admin.js';
import AuditLog from '../../models/AuditLog.js';
import { authenticateAdmin, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '8h' // Shorter expiry for admin tokens
  });
};

// Admin login
router.post('/login', logAdminAction('login', 'admin'), async (req, res) => {
  try {
    const { username, password, twoFactorCode } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required.',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ 
      $or: [{ username }, { email: username }] 
    }).select('+password +twoFactorSecret');

    if (!admin) {
      return res.status(401).json({ 
        message: 'Invalid credentials.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(401).json({ 
        message: 'Account is temporarily locked due to multiple failed login attempts.',
        code: 'ACCOUNT_LOCKED',
        lockUntil: admin.lockUntil
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      
      return res.status(401).json({ 
        message: 'Invalid credentials.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check 2FA if enabled
    if (admin.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          message: 'Two-factor authentication required.',
          requiresTwoFactor: true,
          code: 'TWO_FACTOR_REQUIRED'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2
      });

      if (!verified) {
        await admin.incLoginAttempts();
        return res.status(401).json({ 
          message: 'Invalid two-factor authentication code.',
          code: 'INVALID_2FA'
        });
      }
    }

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Return admin data (excluding sensitive fields)
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.twoFactorSecret;

    res.json({
      message: 'Login successful',
      token,
      admin: adminData
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: 'Server error during login.',
      code: 'SERVER_ERROR'
    });
  }
});

// Get current admin
router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    res.json({ admin });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ 
      message: 'Server error fetching admin data.',
      code: 'SERVER_ERROR'
    });
  }
});

// Setup 2FA
router.post('/setup-2fa', authenticateAdmin, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `NextMind AI Admin (${req.admin.username})`,
      issuer: 'NextMind AI'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Temporarily store secret (don't save to DB until verified)
    req.session = req.session || {};
    req.session.tempTwoFactorSecret = secret.base32;

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({ 
      message: 'Server error setting up 2FA.',
      code: 'SERVER_ERROR'
    });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', authenticateAdmin, async (req, res) => {
  try {
    const { token } = req.body;
    const tempSecret = req.session?.tempTwoFactorSecret;

    if (!tempSecret) {
      return res.status(400).json({ 
        message: 'No 2FA setup in progress.',
        code: 'NO_2FA_SETUP'
      });
    }

    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ 
        message: 'Invalid verification code.',
        code: 'INVALID_CODE'
      });
    }

    // Save secret and enable 2FA
    await Admin.findByIdAndUpdate(req.admin._id, {
      twoFactorSecret: tempSecret,
      twoFactorEnabled: true
    });

    // Clear temporary secret
    delete req.session.tempTwoFactorSecret;

    res.json({ message: 'Two-factor authentication enabled successfully' });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ 
      message: 'Server error verifying 2FA.',
      code: 'SERVER_ERROR'
    });
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticateAdmin, async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before disabling 2FA
    const admin = await Admin.findById(req.admin._id).select('+password');
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid password.',
        code: 'INVALID_PASSWORD'
      });
    }

    await Admin.findByIdAndUpdate(req.admin._id, {
      $unset: { twoFactorSecret: 1 },
      twoFactorEnabled: false
    });

    res.json({ message: 'Two-factor authentication disabled successfully' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ 
      message: 'Server error disabling 2FA.',
      code: 'SERVER_ERROR'
    });
  }
});

// Refresh token
router.post('/refresh', authenticateAdmin, async (req, res) => {
  try {
    const token = generateToken(req.admin._id);
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      message: 'Server error refreshing token.',
      code: 'SERVER_ERROR'
    });
  }
});

// Logout
router.post('/logout', authenticateAdmin, logAdminAction('logout', 'admin'), async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Server error during logout.',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;