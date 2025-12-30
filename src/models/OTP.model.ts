import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  phoneNumber: string;
  code: string;
  purpose: 'register' | 'login' | 'reset_password';
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['register', 'login', 'reset_password'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 } // Auto-delete expired documents
    },
    verified: {
      type: Boolean,
      default: false
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5 // Max verification attempts
    }
  },
  {
    timestamps: true
  }
);

// Index for cleanup queries
OTPSchema.index({ phoneNumber: 1, purpose: 1, verified: 1 });

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema);

