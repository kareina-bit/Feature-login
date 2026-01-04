import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate phone format (supports international format)
        return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(v);
      },
      message: 'Số điện thoại không hợp lệ'
    }
  },
  name: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Tên không được quá 100 ký tự']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'driver'],
      message: 'Role phải là admin, user hoặc driver'
    },
    default: 'user'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email không hợp lệ'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  // Driver specific fields
  driverInfo: {
    licenseNumber: {
      type: String,
      default: null
    },
    vehicleType: {
      type: String,
      enum: ['motorbike', 'car', 'truck', 'van'],
      default: null
    },
    vehiclePlate: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalTrips: {
      type: Number,
      default: 0
    }
  },
  // User/Partner specific fields
  companyInfo: {
    companyName: {
      type: String,
      default: null
    },
    taxCode: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes (phone already has unique index from schema)
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Get user without sensitive data
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;

