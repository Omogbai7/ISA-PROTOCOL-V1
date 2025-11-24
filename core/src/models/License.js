import mongoose from 'mongoose';

const licenseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phoneNumber: {
    type: String,
    default: null,
    index: true
  },
  type: {
    type: String,
    enum: ['trial', 'monthly', 'yearly', 'lifetime'],
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  isActivated: {
    type: Boolean,
    default: false
  },
  activatedAt: {
    type: Date,
    default: null
  },
  activatedBy: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  metadata: {
    paymentReference: String,
    amount: Number,
    currency: String
  }
}, {
  timestamps: true
});

// Static method to generate license code
licenseSchema.statics.generateCode = function() {
  const prefix = 'ISA';
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${random}-${timestamp}`;
};

// Method to activate license
licenseSchema.methods.activate = function(phoneNumber) {
  if (this.isActivated) {
    throw new Error('License already activated');
  }
  if (new Date() > this.expiresAt) {
    throw new Error('License has expired');
  }

  this.isActivated = true;
  this.activatedAt = new Date();
  this.activatedBy = phoneNumber;
  this.phoneNumber = phoneNumber;

  return this.save();
};

export default mongoose.model('License', licenseSchema);
