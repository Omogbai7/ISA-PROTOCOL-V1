import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiry: {
    type: Date,
    default: null
  },
  activationCode: {
    type: String,
    default: null
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  warnings: {
    type: Number,
    default: 0
  },
  lastWarningDate: {
    type: Date,
    default: null
  },
  commandCount: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    silentMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ isPremium: 1, premiumExpiry: 1 });
userSchema.index({ isBanned: 1 });

// Methods
userSchema.methods.addWarning = function() {
  this.warnings += 1;
  this.lastWarningDate = new Date();
  return this.save();
};

userSchema.methods.resetWarnings = function() {
  this.warnings = 0;
  this.lastWarningDate = null;
  return this.save();
};

userSchema.methods.activatePremium = function(durationDays) {
  this.isPremium = true;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);
  this.premiumExpiry = expiry;
  this.activationCode = null;
  return this.save();
};

userSchema.methods.isPremiumActive = function() {
  if (!this.isPremium) return false;
  if (!this.premiumExpiry) return false;
  return new Date() < this.premiumExpiry;
};

export default mongoose.model('User', userSchema);
