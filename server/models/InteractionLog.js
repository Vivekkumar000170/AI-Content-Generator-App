import mongoose from 'mongoose';

const interactionLogSchema = new mongoose.Schema({
  botId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIBot',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: String,
  userInput: {
    type: String,
    required: true,
    maxlength: [5000, 'User input cannot exceed 5000 characters']
  },
  botResponse: {
    type: String,
    required: true,
    maxlength: [10000, 'Bot response cannot exceed 10000 characters']
  },
  responseTime: {
    type: Number,
    required: true // in milliseconds
  },
  tokens: {
    input: Number,
    output: Number,
    total: Number
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    country: String,
    device: String,
    referrer: String
  },
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    helpful: Boolean
  },
  status: {
    type: String,
    enum: ['success', 'error', 'timeout', 'filtered'],
    default: 'success'
  },
  errorDetails: {
    code: String,
    message: String,
    stack: String
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
interactionLogSchema.index({ botId: 1, createdAt: -1 });
interactionLogSchema.index({ sessionId: 1, createdAt: -1 });
interactionLogSchema.index({ status: 1, createdAt: -1 });
interactionLogSchema.index({ 'sentiment.label': 1, createdAt: -1 });

// TTL index to automatically delete old logs (keep for 90 days)
interactionLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('InteractionLog', interactionLogSchema);