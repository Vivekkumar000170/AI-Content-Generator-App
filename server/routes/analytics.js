import express from 'express';
import Analytics from '../models/Analytics.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user analytics dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Content generation stats
    const contentStats = await Analytics.aggregate([
      {
        $match: {
          user: req.user._id,
          event: 'content_generated',
          timestamp: { $gte: startDate },
          'metadata.success': true
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$contentType'
          },
          count: { $sum: 1 },
          totalWords: { $sum: '$metadata.wordCount' },
          avgGenerationTime: { $avg: '$metadata.generationTime' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Overall stats
    const overallStats = await Analytics.aggregate([
      {
        $match: {
          user: req.user._id,
          event: 'content_generated',
          timestamp: { $gte: startDate },
          'metadata.success': true
        }
      },
      {
        $group: {
          _id: null,
          totalGenerated: { $sum: 1 },
          totalWords: { $sum: '$metadata.wordCount' },
          avgGenerationTime: { $avg: '$metadata.generationTime' },
          contentTypes: {
            $addToSet: '$contentType'
          }
        }
      }
    ]);

    // Content type breakdown
    const typeBreakdown = await Analytics.aggregate([
      {
        $match: {
          user: req.user._id,
          event: 'content_generated',
          timestamp: { $gte: startDate },
          'metadata.success': true
        }
      },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          totalWords: { $sum: '$metadata.wordCount' },
          avgWords: { $avg: '$metadata.wordCount' },
          avgGenerationTime: { $avg: '$metadata.generationTime' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Daily activity
    const dailyActivity = await Analytics.aggregate([
      {
        $match: {
          user: req.user._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          totalEvents: { $sum: 1 },
          contentGenerated: {
            $sum: {
              $cond: [{ $eq: ['$event', 'content_generated'] }, 1, 0]
            }
          },
          logins: {
            $sum: {
              $cond: [{ $eq: ['$event', 'login'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      period,
      dateRange: {
        start: startDate,
        end: now
      },
      overview: overallStats[0] || {
        totalGenerated: 0,
        totalWords: 0,
        avgGenerationTime: 0,
        contentTypes: []
      },
      contentStats,
      typeBreakdown,
      dailyActivity
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching analytics.' });
  }
});

// Log custom analytics event
router.post('/event', authenticate, async (req, res) => {
  try {
    const { event, contentType, metadata = {} } = req.body;
    
    if (!event) {
      return res.status(400).json({ message: 'Event type is required.' });
    }

    await Analytics.create({
      user: req.user._id,
      event,
      contentType,
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Event logged successfully' });
  } catch (error) {
    console.error('Log analytics event error:', error);
    res.status(500).json({ message: 'Server error logging event.' });
  }
});

export default router;