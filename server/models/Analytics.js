import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  event: {
    type: String,
    required: true,
    enum: [
      'content_generated',
      'content_saved',
      'content_shared',
      'content_exported',
      'login',
      'signup',
      'plan_upgraded',
      'plan_downgraded',
      'api_key_added',
      'template_used'
    ]
  },
  contentType: {
    type: String,
    enum: ['seo-blog', 'product-description', 'ad-copy', 'social-media']
  },
  metadata: {
    wordCount: Number,
    generationTime: Number, // in milliseconds
    aiModel: String,
    platform: String,
    tone: String,
    success: Boolean,
    errorMessage: String,
    userAgent: String,
    ipAddress: String,
    country: String,
    device: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We're using custom timestamp field
});

// Indexes for analytics queries
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ contentType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

// TTL index to automatically delete old analytics data (keep for 2 years)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.model('Analytics', analyticsSchema);