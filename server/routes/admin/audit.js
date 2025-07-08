import express from 'express';
import AuditLog from '../../models/AuditLog.js';
import { authenticateAdmin, requirePermission } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get audit logs with filtering and pagination
router.get('/', 
  authenticateAdmin, 
  requirePermission('audit_logs'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 50, 
        adminId, 
        action, 
        resource, 
        status,
        startDate,
        endDate,
        search
      } = req.query;

      // Build query
      const query = {};
      if (adminId) query.adminId = adminId;
      if (action) query.action = action;
      if (resource) query.resource = resource;
      if (status) query.status = status;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      if (search) {
        query.$or = [
          { 'details.method': { $regex: search, $options: 'i' } },
          { 'details.url': { $regex: search, $options: 'i' } },
          { errorMessage: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        AuditLog.find(query)
          .populate('adminId', 'username email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      res.json({
        logs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ 
        message: 'Server error fetching audit logs.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get specific audit log
router.get('/:id', 
  authenticateAdmin, 
  requirePermission('audit_logs'),
  async (req, res) => {
    try {
      const log = await AuditLog.findById(req.params.id)
        .populate('adminId', 'username email');

      if (!log) {
        return res.status(404).json({ 
          message: 'Audit log not found.',
          code: 'LOG_NOT_FOUND'
        });
      }

      res.json({ log });
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({ 
        message: 'Server error fetching audit log.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get audit statistics
router.get('/stats/overview', 
  authenticateAdmin, 
  requirePermission('audit_logs'),
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
        totalLogs,
        actionBreakdown,
        resourceBreakdown,
        statusBreakdown,
        adminActivity,
        timelineData
      ] = await Promise.all([
        AuditLog.countDocuments({ createdAt: { $gte: startDate } }),
        
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]),
        
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: '$resource',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]),
        
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]),
        
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: '$adminId',
              count: { $sum: 1 },
              actions: { $addToSet: '$action' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'admins',
              localField: '_id',
              foreignField: '_id',
              as: 'admin'
            }
          },
          {
            $project: {
              count: 1,
              actions: 1,
              admin: { $arrayElemAt: ['$admin.username', 0] }
            }
          }
        ]),
        
        AuditLog.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
              },
              total: { $sum: 1 },
              successful: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
              },
              failed: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
              }
            }
          },
          { $sort: { '_id.date': 1 } }
        ])
      ]);

      res.json({
        period,
        dateRange: { start: startDate, end: now },
        overview: {
          totalLogs,
          actionBreakdown,
          resourceBreakdown,
          statusBreakdown
        },
        adminActivity,
        timeline: timelineData
      });
    } catch (error) {
      console.error('Get audit stats error:', error);
      res.status(500).json({ 
        message: 'Server error fetching audit statistics.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Export audit logs
router.get('/export/csv', 
  authenticateAdmin, 
  requirePermission('audit_logs'),
  async (req, res) => {
    try {
      const { startDate, endDate, adminId, action, resource } = req.query;

      const query = {};
      if (adminId) query.adminId = adminId;
      if (action) query.action = action;
      if (resource) query.resource = resource;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const logs = await AuditLog.find(query)
        .populate('adminId', 'username email')
        .sort({ createdAt: -1 })
        .lean();

      // Convert to CSV
      const csvHeaders = [
        'Date',
        'Admin',
        'Action',
        'Resource',
        'Resource ID',
        'Status',
        'IP Address',
        'User Agent',
        'Error Message'
      ];

      const csvRows = logs.map(log => [
        log.createdAt.toISOString(),
        log.adminId?.username || 'Unknown',
        log.action,
        log.resource,
        log.resourceId || '',
        log.status,
        log.ipAddress || '',
        log.userAgent || '',
        log.errorMessage || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({ 
        message: 'Server error exporting audit logs.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Clean up old audit logs
router.delete('/cleanup', 
  authenticateAdmin, 
  requirePermission('audit_logs'),
  async (req, res) => {
    try {
      const { olderThan = '90d' } = req.body;

      let cutoffDate;
      switch (olderThan) {
        case '30d':
          cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          cutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      }

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      res.json({
        message: `${result.deletedCount} audit logs cleaned up successfully`,
        deletedCount: result.deletedCount,
        cutoffDate
      });
    } catch (error) {
      console.error('Cleanup audit logs error:', error);
      res.status(500).json({ 
        message: 'Server error cleaning up audit logs.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

export default router;