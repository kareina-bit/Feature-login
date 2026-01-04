import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['register', 'reset-password', 'verify-phone'],
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - automatically delete after expiration
  }
}, {
  timestamps: true
});

// Indexes
otpSchema.index({ phone: 1, purpose: 1 });
otpSchema.index({ createdAt: 1 });

// Check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if OTP attempts exceeded
otpSchema.methods.isAttemptsExceeded = function() {
  return this.attempts >= 5;
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;

