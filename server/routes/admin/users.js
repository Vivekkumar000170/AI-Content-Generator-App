import express from 'express';
import Admin from '../../models/Admin.js';
import AuditLog from '../../models/AuditLog.js';
import { authenticateAdmin, requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

// Get all admin users
router.get('/', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role, 
        status, 
        search, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      // Build query
      const query = {};
      if (role) query.role = role;
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [admins, total] = await Promise.all([
        Admin.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .select('-password -twoFactorSecret')
          .lean(),
        Admin.countDocuments(query)
      ]);

      res.json({
        admins,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get admin users error:', error);
      res.status(500).json({ 
        message: 'Server error fetching admin users.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get specific admin user
router.get('/:id', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id)
        .select('-password -twoFactorSecret');

      if (!admin) {
        return res.status(404).json({ 
          message: 'Admin user not found.',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      // Get recent activities for this admin
      const recentActivities = await AuditLog.find({ adminId: req.params.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('action resource details createdAt');

      res.json({ 
        admin,
        recentActivities
      });
    } catch (error) {
      console.error('Get admin user error:', error);
      res.status(500).json({ 
        message: 'Server error fetching admin user.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Create new admin user
router.post('/', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  logAdminAction('create', 'admin'),
  async (req, res) => {
    try {
      const { username, email, password, role, permissions } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({ 
          message: 'Username, email, and password are required.',
          code: 'MISSING_FIELDS'
        });
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        $or: [{ username }, { email }]
      });

      if (existingAdmin) {
        return res.status(400).json({ 
          message: 'Admin with this username or email already exists.',
          code: 'ADMIN_EXISTS'
        });
      }

      const adminData = {
        username,
        email,
        password,
        role: role || 'admin',
        permissions: permissions || []
      };

      const admin = new Admin(adminData);
      await admin.save();

      // Remove sensitive data from response
      const adminResponse = admin.toObject();
      delete adminResponse.password;
      delete adminResponse.twoFactorSecret;

      res.status(201).json({
        message: 'Admin user created successfully',
        admin: adminResponse
      });
    } catch (error) {
      console.error('Create admin user error:', error);
      
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
        message: 'Server error creating admin user.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Update admin user
router.put('/:id', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  logAdminAction('update', 'admin'),
  async (req, res) => {
    try {
      const { username, email, role, permissions, isActive } = req.body;

      // Prevent self-deactivation
      if (req.params.id === req.admin._id.toString() && isActive === false) {
        return res.status(400).json({ 
          message: 'Cannot deactivate your own account.',
          code: 'SELF_DEACTIVATION'
        });
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (permissions) updateData.permissions = permissions;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;

      const admin = await Admin.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -twoFactorSecret');

      if (!admin) {
        return res.status(404).json({ 
          message: 'Admin user not found.',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      res.json({
        message: 'Admin user updated successfully',
        admin
      });
    } catch (error) {
      console.error('Update admin user error:', error);
      
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
        message: 'Server error updating admin user.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Delete admin user
router.delete('/:id', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  logAdminAction('delete', 'admin'),
  async (req, res) => {
    try {
      // Prevent self-deletion
      if (req.params.id === req.admin._id.toString()) {
        return res.status(400).json({ 
          message: 'Cannot delete your own account.',
          code: 'SELF_DELETION'
        });
      }

      const admin = await Admin.findByIdAndDelete(req.params.id);

      if (!admin) {
        return res.status(404).json({ 
          message: 'Admin user not found.',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      res.json({ message: 'Admin user deleted successfully' });
    } catch (error) {
      console.error('Delete admin user error:', error);
      res.status(500).json({ 
        message: 'Server error deleting admin user.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Reset admin password
router.post('/:id/reset-password', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  logAdminAction('update', 'admin'),
  async (req, res) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ 
          message: 'New password must be at least 8 characters long.',
          code: 'INVALID_PASSWORD'
        });
      }

      const admin = await Admin.findById(req.params.id);

      if (!admin) {
        return res.status(404).json({ 
          message: 'Admin user not found.',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      admin.password = newPassword;
      admin.loginAttempts = 0;
      admin.lockUntil = undefined;
      await admin.save();

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        message: 'Server error resetting password.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Unlock admin account
router.post('/:id/unlock', 
  authenticateAdmin, 
  requirePermission('manage_users'),
  logAdminAction('update', 'admin'),
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);

      if (!admin) {
        return res.status(404).json({ 
          message: 'Admin user not found.',
          code: 'ADMIN_NOT_FOUND'
        });
      }

      await admin.resetLoginAttempts();

      res.json({ message: 'Account unlocked successfully' });
    } catch (error) {
      console.error('Unlock account error:', error);
      res.status(500).json({ 
        message: 'Server error unlocking account.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get admin activity logs
router.get('/:id/activities', 
  authenticateAdmin, 
  requirePermission('audit_logs'),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, action, resource } = req.query;

      const query = { adminId: req.params.id };
      if (action) query.action = action;
      if (resource) query.resource = resource;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [activities, total] = await Promise.all([
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        AuditLog.countDocuments(query)
      ]);

      res.json({
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get admin activities error:', error);
      res.status(500).json({ 
        message: 'Server error fetching admin activities.',
        code: 'SERVER_ERROR'
      });
    }
  }
);

export default router;