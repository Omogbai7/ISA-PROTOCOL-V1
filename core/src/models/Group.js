import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  settings: {
    antiTag: {
      enabled: {
        type: Boolean,
        default: false
      },
      maxMentions: {
        type: Number,
        default: 5
      },
      action: {
        type: String,
        enum: ['warn', 'delete', 'kick'],
        default: 'warn'
      }
    },
    autoKick: {
      enabled: {
        type: Boolean,
        default: false
      },
      warningThreshold: {
        type: Number,
        default: 3
      }
    },
    autoDelete: {
      enabled: {
        type: Boolean,
        default: false
      },
      deleteLinks: {
        type: Boolean,
        default: false
      },
      deleteSpam: {
        type: Boolean,
        default: false
      }
    },
    ghostMode: {
      type: Boolean,
      default: true
    },
    welcomeMessage: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: {
        type: String,
        default: 'Welcome to the group!'
      }
    }
  },
  admins: [{
    type: String
  }],
  bannedUsers: [{
    phoneNumber: String,
    bannedAt: Date,
    reason: String
  }],
  statistics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    totalCommands: {
      type: Number,
      default: 0
    },
    totalWarnings: {
      type: Number,
      default: 0
    },
    totalKicks: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Methods
groupSchema.methods.isUserBanned = function(phoneNumber) {
  return this.bannedUsers.some(banned => banned.phoneNumber === phoneNumber);
};

groupSchema.methods.banUser = function(phoneNumber, reason) {
  if (!this.isUserBanned(phoneNumber)) {
    this.bannedUsers.push({
      phoneNumber,
      bannedAt: new Date(),
      reason: reason || 'No reason provided'
    });
    this.statistics.totalKicks += 1;
  }
  return this.save();
};

groupSchema.methods.unbanUser = function(phoneNumber) {
  this.bannedUsers = this.bannedUsers.filter(banned => banned.phoneNumber !== phoneNumber);
  return this.save();
};

groupSchema.methods.incrementStats = function(type) {
  if (this.statistics[type] !== undefined) {
    this.statistics[type] += 1;
  }
  this.lastActive = new Date();
  return this.save();
};

export default mongoose.model('Group', groupSchema);
