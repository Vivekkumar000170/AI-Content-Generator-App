import express from 'express';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// Update user plan
router.put('/plan', authenticate, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['starter', 'professional', 'enterprise'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan type.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        plan,
        'subscription.status': 'active',
        'subscription.startDate': new Date(),
        'subscription.endDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      { new: true, runValidators: true }
    );

    // Log analytics
    await Analytics.create({
      user: req.user._id,
      event: req.user.plan === 'starter' ? 'plan_upgraded' : 'plan_downgraded',
      metadata: {
        oldPlan: req.user.plan,
        newPlan: plan
      }
    });

    res.json({
      message: 'Plan updated successfully',
      user
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error updating plan.' });
  }
});

// Add/Update OpenAI API key
router.put('/api-keys/openai', authenticate, async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.status(400).json({ message: 'Invalid OpenAI API key format.' });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { 'apiKeys.openai': apiKey },
      { new: true }
    );

    // Log analytics
    await Analytics.create({
      user: req.user._id,
      event: 'api_key_added',
      metadata: {
        keyType: 'openai'
      }
    });

    res.json({ message: 'OpenAI API key updated successfully' });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ message: 'Server error updating API key.' });
  }
});

// Get usage statistics
router.get('/usage', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get this month's analytics
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyAnalytics = await Analytics.aggregate([
      {
        $match: {
          user: req.user._id,
          timestamp: { $gte: startOfMonth },
          event: 'content_generated'
        }
      },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          totalWords: { $sum: '$metadata.wordCount' }
        }
      }
    ]);

    res.json({
      usage: {
        current: user.usage.wordsGenerated,
        limit: user.usage.wordsLimit,
        remaining: user.usage.wordsLimit === -1 ? -1 : Math.max(0, user.usage.wordsLimit - user.usage.wordsGenerated),
        percentage: user.usagePercentage,
        resetDate: user.usage.resetDate
      },
      subscription: {
        status: user.subscription.status,
        plan: user.plan,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        daysRemaining: user.daysRemaining
      },
      monthlyStats: monthlyAnalytics
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ message: 'Server error fetching usage data.' });
  }
});

// Reset monthly usage (admin function or scheduled job)
router.post('/usage/reset', authenticate, async (req, res) => {
  try {
    // This should typically be restricted to admin users or run as a scheduled job
    if (req.user.plan !== 'enterprise') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    await req.user.resetMonthlyUsage();
    
    res.json({ message: 'Monthly usage reset successfully' });
  } catch (error) {
    console.error('Reset usage error:', error);
    res.status(500).json({ message: 'Server error resetting usage.' });
  }
});

export default router;