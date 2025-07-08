import mongoose from 'mongoose';

const aiBotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Bot name is required'],
    trim: true,
    maxlength: [100, 'Bot name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Bot description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  personality: {
    tone: {
      type: String,
      enum: ['professional', 'friendly', 'casual', 'formal', 'humorous'],
      default: 'professional'
    },
    traits: [{
      type: String,
      enum: ['helpful', 'patient', 'knowledgeable', 'creative', 'analytical', 'empathetic']
    }],
    responseStyle: {
      type: String,
      enum: ['concise', 'detailed', 'conversational', 'technical'],
      default: 'conversational'
    }
  },
  configuration: {
    model: {
      type: String,
      enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'gemini-pro'],
      default: 'gpt-3.5-turbo'
    },
    temperature: {
      type: Number,
      min: 0,
      max: 2,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      min: 1,
      max: 4000,
      default: 1000
    },
    systemPrompt: {
      type: String,
      required: true,
      maxlength: [2000, 'System prompt cannot exceed 2000 characters']
    }
  },
  capabilities: [{
    type: String,
    enum: [
      'text_generation',
      'question_answering',
      'code_assistance',
      'creative_writing',
      'data_analysis',
      'customer_support'
    ]
  }],
  limitations: [{
    type: String,
    maxlength: [200, 'Each limitation cannot exceed 200 characters']
  }],
  trainingData: {
    sources: [{
      name: String,
      type: {
        type: String,
        enum: ['document', 'url', 'text', 'api']
      },
      content: String,
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }],
    lastTraining: Date,
    version: {
      type: String,
      default: '1.0.0'
    }
  },
  apiEndpoints: [{
    name: String,
    url: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE'],
      default: 'POST'
    },
    headers: mongoose.Schema.Types.Mixed,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'training', 'maintenance'],
    default: 'inactive'
  },
  metrics: {
    totalInteractions: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    lastInteraction: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
aiBotSchema.index({ name: 1 });
aiBotSchema.index({ status: 1 });
aiBotSchema.index({ createdBy: 1 });
aiBotSchema.index({ 'metrics.totalInteractions': -1 });

// Virtual for uptime calculation
aiBotSchema.virtual('uptime').get(function() {
  if (this.status === 'active' && this.createdAt) {
    return Date.now() - this.createdAt.getTime();
  }
  return 0;
});

// Method to update metrics
aiBotSchema.methods.updateMetrics = function(responseTime, success = true) {
  this.metrics.totalInteractions += 1;
  this.metrics.lastInteraction = new Date();
  
  // Update average response time
  const currentAvg = this.metrics.averageResponseTime || 0;
  const totalInteractions = this.metrics.totalInteractions;
  this.metrics.averageResponseTime = 
    (currentAvg * (totalInteractions - 1) + responseTime) / totalInteractions;
  
  // Update success rate
  const currentSuccessRate = this.metrics.successRate || 0;
  const currentSuccessCount = Math.round(currentSuccessRate * (totalInteractions - 1) / 100);
  const newSuccessCount = success ? currentSuccessCount + 1 : currentSuccessCount;
  this.metrics.successRate = (newSuccessCount / totalInteractions) * 100;
  
  return this.save();
};

export default mongoose.model('AIBot', aiBotSchema);