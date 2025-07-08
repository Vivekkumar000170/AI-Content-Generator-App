import express from 'express';
import AIBot from '../../models/AIBot.js';
import InteractionLog from '../../models/InteractionLog.js';
import LandingPageContent from '../../models/LandingPageContent.js';
import MediaAsset from '../../models/MediaAsset.js';
import Admin from '../../models/Admin.js';
import AuditLog from '../../models/AuditLog.js';
import { authenticateAdmin, requirePermission } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get dashboard overview
router.get('/dashboard', 
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
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get overview statistics
      const [
        totalBots,
        activeBots,
        totalInteractions,
        totalContent,
        publishedContent,
        totalMedia,
        totalAdmins,
        recentInteractions
      ] = await Promise.all([
        AIBot.countDocuments(),
        AIBot.countDocuments({ status: 'active' }),
        InteractionLog.countDocuments({ createdAt: { $gte: startDate } }),
        LandingPageContent.countDocuments(),
        LandingPageContent.countDocuments({ isPublished: true }),
        MediaAsset.countDocuments(),
        Admin.countDocuments({ isActive: true }),
        InteractionLog.countDocuments({ 
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        })
      ]);

      // Bot performance metrics
      const botMetrics = await AIBot.aggregate([
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$metrics.averageResponseTime' },
            avgSuccessRate: { $avg: '$metrics.successRate' },
            totalInteractions: { $sum: '$metrics.totalInteractions' }
          }
        }
      ]);

      // Interaction trends
      const interactionTrends = await InteractionLog.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
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
      ]);

      // Top performing bots
      const topBots = await AIBot.find({ status: 'active' })
        .sort({ 'metrics.totalInteractions': -1 })
        .limit(5)
        .select('name metrics.totalInteractions metrics.successRate metrics.averageResponseTime');

      // Recent admin activities
      const recentActivities = await AuditLog.find()
        .populate('adminId', 'username')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('action resource details createdAt adminId');

      // System health metrics
      const systemHealth = {
        botsOnline: activeBots,
        totalBots,
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        lastBackup: null // Would be implemented with actual backup system
      };

      res.json({
        period,
        dateRange: { start: startDate, end: now },
        overview: {
          totalBots,
          activeBots,
          totalInteractions,
          recentInteractions,
          totalContent,
          publishedContent,
          totalMedia,
          totalAdmins
        },
        performance: botMetrics[0] || {
          avgResponseTime: 0,
          avgSuccessRate: 0,
          totalInteractions: 0
        },
        trends: {
          interactions: interactionTrends
        },
        topBots,
        recentActivities,
        systemHealth
      });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({ 
        message: 'Server error fetching dashboard analytics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get detailed bot analytics
router.get('/bots/:id', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      const botId = req.params.id;
      
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

      // Get bot details
      const bot = await AIBot.findById(botId);
      if (!bot) {
        return res.status(404).json({ 
          message: 'Bot not found.',
          code: 'BOT_NOT_FOUND'
        });
      }

      // Detailed analytics
      const [
        totalInteractions,
        successfulInteractions,
        avgResponseTime,
        sentimentAnalysis,
        hourlyDistribution,
        commonQueries,
        errorAnalysis
      ] = await Promise.all([
        InteractionLog.countDocuments({
          botId,
          createdAt: { $gte: startDate }
        }),
        
        InteractionLog.countDocuments({
          botId,
          createdAt: { $gte: startDate },
          status: 'success'
        }),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: bot._id,
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
              botId: bot._id,
              createdAt: { $gte: startDate },
              'sentiment.label': { $exists: true }
            }
          },
          {
            $group: {
              _id: '$sentiment.label',
              count: { $sum: 1 },
              avgScore: { $avg: '$sentiment.score' }
            }
          }
        ]),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: bot._id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: { $hour: '$createdAt' },
              interactions: { $sum: 1 },
              avgResponseTime: { $avg: '$responseTime' }
            }
          },
          { $sort: { '_id': 1 } }
        ]),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: bot._id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$userInput',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        InteractionLog.aggregate([
          {
            $match: {
              botId: bot._id,
              createdAt: { $gte: startDate },
              status: { $ne: 'success' }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              errors: { $push: '$errorDetails' }
            }
          }
        ])
      ]);

      const successRate = totalInteractions > 0 ? 
        (successfulInteractions / totalInteractions) * 100 : 0;

      res.json({
        bot: {
          id: bot._id,
          name: bot.name,
          status: bot.status
        },
        period,
        dateRange: { start: startDate, end: now },
        metrics: {
          totalInteractions,
          successfulInteractions,
          successRate,
          avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0
        },
        sentimentAnalysis,
        hourlyDistribution,
        commonQueries,
        errorAnalysis
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

// Get content analytics
router.get('/content', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const [
        contentBySection,
        publishingTrends,
        contentVersions,
        mostEditedContent
      ] = await Promise.all([
        LandingPageContent.aggregate([
          {
            $group: {
              _id: '$section',
              total: { $sum: 1 },
              published: {
                $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
              }
            }
          }
        ]),
        
        LandingPageContent.aggregate([
          {
            $match: { publishedAt: { $exists: true } }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } }
              },
              published: { $sum: 1 }
            }
          },
          { $sort: { '_id.date': 1 } }
        ]),
        
        LandingPageContent.aggregate([
          {
            $group: {
              _id: '$section',
              versions: { $sum: 1 },
              latestVersion: { $max: '$version' }
            }
          }
        ]),
        
        LandingPageContent.aggregate([
          {
            $group: {
              _id: '$section',
              editCount: { $sum: 1 },
              lastModified: { $max: '$updatedAt' }
            }
          },
          { $sort: { editCount: -1 } },
          { $limit: 5 }
        ])
      ]);

      res.json({
        contentBySection,
        publishingTrends,
        contentVersions,
        mostEditedContent
      });
    } catch (error) {
      console.error('Get content analytics error:', error);
      res.status(500).json({ 
        message: 'Server error fetching content analytics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get user interaction logs with filtering
router.get('/interactions', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        botId, 
        status, 
        sentiment,
        startDate,
        endDate,
        search
      } = req.query;

      // Build query
      const query = {};
      if (botId) query.botId = botId;
      if (status) query.status = status;
      if (sentiment) query['sentiment.label'] = sentiment;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      if (search) {
        query.$or = [
          { userInput: { $regex: search, $options: 'i' } },
          { botResponse: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [interactions, total] = await Promise.all([
        InteractionLog.find(query)
          .populate('botId', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        InteractionLog.countDocuments(query)
      ]);

      res.json({
        interactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get interactions error:', error);
      res.status(500).json({ 
        message: 'Server error fetching interactions.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get system performance metrics
router.get('/system', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const { period = '24h' } = req.query;
      
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (period) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // System metrics
      const systemMetrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform
      };

      // Database metrics
      const [
        totalInteractions,
        avgResponseTime,
        errorRate,
        activeConnections
      ] = await Promise.all([
        InteractionLog.countDocuments({ createdAt: { $gte: startDate } }),
        
        InteractionLog.aggregate([
          {
            $match: {
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
            $match: { createdAt: { $gte: startDate } }
          },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              errors: {
                $sum: { $cond: [{ $ne: ['$status', 'success'] }, 1, 0] }
              }
            }
          }
        ]),
        
        // This would be replaced with actual connection monitoring
        Promise.resolve(1)
      ]);

      const errorRateCalc = errorRate[0] ? 
        (errorRate[0].errors / errorRate[0].total) * 100 : 0;

      res.json({
        period,
        dateRange: { start: startDate, end: now },
        system: systemMetrics,
        performance: {
          totalInteractions,
          avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
          errorRate: errorRateCalc,
          activeConnections
        }
      });
    } catch (error) {
      console.error('Get system analytics error:', error);
      res.status(500).json({ 
        message: 'Server error fetching system analytics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Export analytics data
router.get('/export', 
  authenticateAdmin, 
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const { type, format = 'json', startDate, endDate } = req.query;

      if (!type) {
        return res.status(400).json({ 
          message: 'Export type is required.',
          code: 'MISSING_TYPE'
        });
      }

      const dateQuery = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);

      let data;
      let filename;

      switch (type) {
        case 'interactions':
          data = await InteractionLog.find(
            dateQuery.createdAt ? { createdAt: dateQuery } : {}
          ).populate('botId', 'name').lean();
          filename = `interactions_${Date.now()}`;
          break;
          
        case 'bots':
          data = await AIBot.find().populate('createdBy', 'username').lean();
          filename = `bots_${Date.now()}`;
          break;
          
        case 'audit':
          data = await AuditLog.find(
            dateQuery.createdAt ? { createdAt: dateQuery } : {}
          ).populate('adminId', 'username').lean();
          filename = `audit_${Date.now()}`;
          break;
          
        default:
          return res.status(400).json({ 
            message: 'Invalid export type.',
            code: 'INVALID_TYPE'
          });
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
        res.json(data);
      }
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({ 
        message: 'Server error exporting analytics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

export default router;