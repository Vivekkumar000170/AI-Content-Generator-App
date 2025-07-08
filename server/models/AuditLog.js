import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'create', 'read', 'update', 'delete',
      'login', 'logout', 'login_failed',
      'permission_granted', 'permission_revoked',
      'bot_activated', 'bot_deactivated',
      'content_published', 'content_unpublished',
      'media_uploaded', 'media_deleted',
      'settings_changed', 'backup_created'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: [
      'admin', 'bot', 'content', 'media', 'settings',
      'user', 'analytics', 'system'
    ]
  },
  resourceId: String,
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  },
  errorMessage: String
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });

// TTL index to automatically delete old audit logs (keep for 1 year)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model('AuditLog', auditLogSchema);