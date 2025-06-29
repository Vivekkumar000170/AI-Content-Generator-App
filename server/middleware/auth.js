import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Please authenticate.' });
    }

    if (!roles.includes(req.user.plan)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredPlan: roles,
        currentPlan: req.user.plan
      });
    }

    next();
  };
};

export const checkUsageLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const estimatedWordCount = req.body.estimatedWordCount || 500;

    if (!user.canGenerateContent(estimatedWordCount)) {
      return res.status(429).json({
        message: 'Usage limit exceeded.',
        usage: {
          current: user.usage.wordsGenerated,
          limit: user.usage.wordsLimit,
          remaining: Math.max(0, user.usage.wordsLimit - user.usage.wordsGenerated)
        },
        subscription: {
          status: user.subscription.status,
          plan: user.plan,
          daysRemaining: user.daysRemaining
        }
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking usage limits.' });
  }
};