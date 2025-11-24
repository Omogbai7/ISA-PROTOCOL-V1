import mongoose from 'mongoose';

const commandLogSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true,
    index: true
  },
  user: {
    phoneNumber: String,
    name: String
  },
  group: {
    groupId: String,
    name: String
  },
  args: [String],
  success: {
    type: Boolean,
    default: true
  },
  error: {
    type: String,
    default: null
  },
  executionTime: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for analytics queries
commandLogSchema.index({ command: 1, timestamp: -1 });
commandLogSchema.index({ 'user.phoneNumber': 1, timestamp: -1 });
commandLogSchema.index({ 'group.groupId': 1, timestamp: -1 });

// Static method for analytics
commandLogSchema.statics.getTopCommands = async function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$command',
        count: { $sum: 1 },
        successRate: {
          $avg: { $cond: ['$success', 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

commandLogSchema.statics.getTopUsers = async function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$user.phoneNumber',
        name: { $first: '$user.name' },
        commandCount: { $sum: 1 }
      }
    },
    { $sort: { commandCount: -1 } },
    { $limit: limit }
  ]);
};

export default mongoose.model('CommandLog', commandLogSchema);
