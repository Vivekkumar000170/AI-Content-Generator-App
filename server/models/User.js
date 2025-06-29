import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: 'starter'
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'cancelled'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  usage: {
    wordsGenerated: {
      type: Number,
      default: 0
    },
    wordsLimit: {
      type: Number,
      default: 1000 // Starter plan limit
    },
    resetDate: {
      type: Date,
      default: () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    }
  },
  preferences: {
    defaultTone: {
      type: String,
      default: 'professional'
    },
    defaultLanguage: {
      type: String,
      default: 'en'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  apiKeys: {
    openai: {
      type: String,
      select: false // Keep API keys private
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days remaining in trial/subscription
userSchema.virtual('daysRemaining').get(function() {
  if (this.subscription.endDate) {
    const now = new Date();
    const endDate = new Date(this.subscription.endDate);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
  return 0;
});

// Virtual for usage percentage
userSchema.virtual('usagePercentage').get(function() {
  return Math.round((this.usage.wordsGenerated / this.usage.wordsLimit) * 100);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update usage limits based on plan
userSchema.pre('save', function(next) {
  if (this.isModified('plan')) {
    switch (this.plan) {
      case 'starter':
        this.usage.wordsLimit = 1000;
        break;
      case 'professional':
        this.usage.wordsLimit = 10000;
        break;
      case 'enterprise':
        this.usage.wordsLimit = -1; // Unlimited
        break;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user can generate content
userSchema.methods.canGenerateContent = function(wordCount = 0) {
  if (this.plan === 'enterprise') return true;
  if (this.subscription.status !== 'active' && this.subscription.status !== 'trial') return false;
  if (this.subscription.endDate < new Date()) return false;
  if (this.usage.wordsLimit === -1) return true;
  return (this.usage.wordsGenerated + wordCount) <= this.usage.wordsLimit;
};

// Update usage
userSchema.methods.updateUsage = function(wordCount) {
  this.usage.wordsGenerated += wordCount;
  return this.save();
};

// Reset monthly usage
userSchema.methods.resetMonthlyUsage = function() {
  this.usage.wordsGenerated = 0;
  this.usage.resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  return this.save();
};

export default mongoose.model('User', userSchema);