import mongoose from 'mongoose';
import crypto from 'crypto';

const emailVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    length: 6 // 6-digit verification code
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for email verification before user creation
  },
  verified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Maximum 5 verification attempts
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
    index: { expireAfterSeconds: 0 }
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Generate secure token and code before saving
emailVerificationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate secure random token (32 bytes = 64 hex characters)
    this.token = crypto.randomBytes(32).toString('hex');
    
    // Generate 6-digit verification code
    this.code = Math.floor(100000 + Math.random() * 900000).toString();
  }
  next();
});

// Method to check if verification is expired
emailVerificationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to increment attempts
emailVerificationSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to verify and mark as complete
emailVerificationSchema.methods.verify = function() {
  this.verified = true;
  this.attempts += 1;
  return this.save();
};

// Static method to clean up expired tokens
emailVerificationSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

export default mongoose.model('EmailVerification', emailVerificationSchema);