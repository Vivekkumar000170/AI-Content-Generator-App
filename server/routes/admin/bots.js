import express from 'express';
import AIBot from '../../models/AIBot.js';
import InteractionLog from '../../models/InteractionLog.js';
import { authenticateAdmin, requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all bots with pagination and filtering
router.get('/', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        search, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      // Build query
      const query = {};
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [bots, total] = await Promise.all([
        AIBot.find(query)
          .populate('createdBy', 'username email')
          .populate('lastModifiedBy', 'username email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        AIBot.countDocuments(query)
      ]);

      res.json({
        bots,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get bots error:', error);
      res.status(500).json({ 
        message: 'Server error fetching bots.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get specific bot
router.get('/:id', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  async (req, res) => {
    try {
      const bot = await AIBot.findById(req.params.id)
        .populate('createdBy', 'username email')
        .populate('lastModifiedBy', 'username email');

      if (!bot) {
        return res.status(404).json({ 
          message: 'Bot not found.',
          code: 'BOT_NOT_FOUND'
        });
      }

      res.json({ bot });
    } catch (error) {
      console.error('Get bot error:', error);
      res.status(500).json({ 
        message: 'Server error fetching bot.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Create new bot
router.post('/', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  logAdminAction('create', 'bot'),
  async (req, res) => {
    try {
      const botData = {
        ...req.body,
        createdBy: req.admin._id,
        lastModifiedBy: req.admin._id
      };

      const bot = new AIBot(botData);
      await bot.save();

      await bot.populate('createdBy', 'username email');

      res.status(201).json({
        message: 'Bot created successfully',
        bot
      });
    } catch (error) {
      console.error('Create bot error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        });
      }
      
      res.status(500).json({ 
        message: 'Server error creating bot.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Update bot
router.put('/:id', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  logAdminAction('update', 'bot'),
  async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        lastModifiedBy: req.admin._id
      };

      const bot = await AIBot.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy lastModifiedBy', 'username email');

      if (!bot) {
        return res.status(404).json({ 
          message: 'Bot not found.',
          code: 'BOT_NOT_FOUND'
        });
      }

      res.json({
        message: 'Bot updated successfully',
        bot
      });
    } catch (error) {
      console.error('Update bot error:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        });
      }
      
      res.status(500).json({ 
        message: 'Server error updating bot.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Delete bot
router.delete('/:id', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  logAdminAction('delete', 'bot'),
  async (req, res) => {
    try {
      const bot = await AIBot.findByIdAndDelete(req.params.id);

      if (!bot) {
        return res.status(404).json({ 
          message: 'Bot not found.',
          code: 'BOT_NOT_FOUND'
        });
      }

      // Also delete related interaction logs
      await InteractionLog.deleteMany({ botId: req.params.id });

      res.json({ message: 'Bot deleted successfully' });
    } catch (error) {
      console.error('Delete bot error:', error);
      res.status(500).json({ 
        message: 'Server error deleting bot.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Activate/Deactivate bot
router.patch('/:id/status', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  logAdminAction('update', 'bot'),
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!['active', 'inactive', 'maintenance'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status value.',
          code: 'INVALID_STATUS'
        });
      }

      const bot = await AIBot.findByIdAndUpdate(
        req.params.id,
        { 
          status,
          lastModifiedBy: req.admin._id
        },
        { new: true }
      );

      if (!bot) {
        return res.status(404).json({ 
          message: 'Bot not found.',
          code: 'BOT_NOT_FOUND'
        });
      }

      res.json({
        message: `Bot ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
        bot
      });
    } catch (error) {
      console.error('Update bot status error:', error);
      res.status(500).json({ 
        message: 'Server error updating bot status.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get bot analytics
router.get('/:id/analytics', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const [
        totalInteractions,
        avgResponseTime,
        successRate,
        sentimentAnalysis,
        dailyStats
      ] = await Promise.all([
        InteractionLog.countDocuments({
          botId: req.params.id,
          createdAt: { $gte: startDate }
        }),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: req.params.id,
              createdAt: { $gte: startDate },
              status: 'success'
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: req.params.id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              successful: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
              }
            }
          }
        ]),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: req.params.id,
              createdAt: { $gte: startDate },
              'sentiment.label': { $exists: true }
            }
          },
          {
            $group: {
              _id: '$sentiment.label',
              count: { $sum: 1 }
            }
          }
        ]),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: req.params.id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
              },
              interactions: { $sum: 1 },
              avgResponseTime: { $avg: '$responseTime' },
              successRate: {
                $avg: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
              }
            }
          },
          { $sort: { '_id.date': 1 } }
        ])
      ]);

      res.json({
        period,
        dateRange: { start: startDate, end: now },
        metrics: {
          totalInteractions,
          avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
          successRate: successRate[0] ? 
            (successRate[0].successful / successRate[0].total) * 100 : 0,
          sentimentAnalysis,
          dailyStats
        }
      });
    } catch (error) {
      console.error('Get bot analytics error:', error);
      res.status(500).json({ 
        message: 'Server error fetching bot analytics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Test bot configuration
router.post('/:id/test', 
  authenticateAdmin, 
  requirePermission('manage_bots'),
  async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          message: 'Test message is required.',
          code: 'MISSING_MESSAGE'
        });
      }

      const bot = await AIBot.findById(req.params.id);
      
      if (!bot) {
        return res.status(404).json({ 
          message: 'Bot not found.',
          code: 'BOT_NOT_FOUND'
        });
      }

      // Simulate bot response (integrate with actual AI service)
      const startTime = Date.now();
      
      // This would be replaced with actual AI service call
      const response = `Test response from ${bot.name}: I received your message "${message}". This is a test response based on my ${bot.personality.tone} personality.`;
      
      const responseTime = Date.now() - startTime;

      res.json({
        message: 'Bot test completed',
        test: {
          input: message,
          output: response,
          responseTime,
          botConfig: {
            name: bot.name,
            personality: bot.personality,
            model: bot.configuration.model
          }
        }
      });
    } catch (error) {
      console.error('Test bot error:', error);
      res.status(500).json({ 
        message: 'Server error testing bot.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

export default router;