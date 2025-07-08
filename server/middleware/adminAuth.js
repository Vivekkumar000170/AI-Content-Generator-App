import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const admin = await Admin.findById(decoded.adminId).select('+password');
    
    if (!admin) {
      return res.status(401).json({ 
        message: 'Invalid token. Admin not found.',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (admin.isLocked) {
      return res.status(401).json({ 
        message: 'Account is temporarily locked due to multiple failed login attempts.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(500).json({ 
      message: 'Server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        message: 'Access denied. Please authenticate.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!req.admin.hasPermission(permission)) {
      // Log unauthorized access attempt
      AuditLog.create({
        adminId: req.admin._id,
        action: 'permission_denied',
        resource: 'system',
        details: {
          requiredPermission: permission,
          userPermissions: req.admin.permissions
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failed'
      }).catch(console.error);

      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermission: permission,
        userPermissions: req.admin.permissions
      });
    }

    next();
  };
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        message: 'Access denied. Please authenticate.',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient role.',
        code: 'INSUFFICIENT_ROLE',
        requiredRoles: allowedRoles,
        userRole: req.admin.role
      });
    }

    next();
  };
};

// Middleware to log admin actions
export const logAdminAction = (action, resource) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      if (req.admin) {
        const logData = {
          adminId: req.admin._id,
          action,
          resource,
          resourceId: req.params.id || req.body.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status: res.statusCode < 400 ? 'success' : 'failed'
        };

        if (res.statusCode >= 400) {
          try {
            const errorData = JSON.parse(data);
            logData.errorMessage = errorData.message;
          } catch (e) {
            logData.errorMessage = 'Unknown error';
          }
        }

        AuditLog.create(logData).catch(console.error);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};