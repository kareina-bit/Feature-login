import OTP from '../models/OTP.model.js';
import twilio from 'twilio';

// Initialize Twilio client (if configured)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via SMS using Twilio
 */
const sendSMS = async (phone, otp) => {
  if (!twilioClient) {
    console.log('⚠️ Twilio not configured. OTP:', otp);
    return { success: true, message: 'OTP sent (mock)', otp }; // Mock for development
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong ${process.env.OTP_EXPIRE_MINUTES || 5} phút.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log(`✅ SMS sent to ${phone}: ${message.sid}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    throw new Error('Failed to send OTP via SMS');
  }
};

/**
 * Create and send OTP
 */
export const createOTP = async (phone, purpose = 'register') => {
  try {
    // Delete any existing OTPs for this phone and purpose
    await OTP.deleteMany({ phone, purpose });

    // Generate new OTP
    const otpCode = generateOTP();
    
    // Calculate expiration time
    const expiryMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save OTP to database
    const otp = await OTP.create({
      phone,
      otp: otpCode,
      purpose,
      expiresAt
    });

    // Send OTP via SMS
    const smsResult = await sendSMS(phone, otpCode);

    console.log(`📱 OTP created for ${phone} (${purpose}): ${otpCode}`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresAt: otp.expiresAt,
      // Only return OTP in development for testing
      ...(process.env.NODE_ENV === 'development' && { otp: otpCode })
    };
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (phone, otpCode, purpose = 'register') => {
  try {
    // Find OTP
    const otp = await OTP.findOne({ 
      phone, 
      purpose,
      isUsed: false 
    }).sort({ createdAt: -1 });

    if (!otp) {
      return {
        success: false,
        message: 'OTP không tồn tại hoặc đã được sử dụng'
      };
    }

    // Check if OTP is expired
    if (otp.isExpired()) {
      await OTP.deleteOne({ _id: otp._id });
      return {
        success: false,
        message: 'OTP đã hết hạn'
      };
    }

    // Check attempts
    if (otp.isAttemptsExceeded()) {
      await OTP.deleteOne({ _id: otp._id });
      return {
        success: false,
        message: 'Đã vượt quá số lần thử. Vui lòng gửi lại OTP mới'
      };
    }

    // Verify OTP
    if (otp.otp !== otpCode) {
      // Increment attempts
      otp.attempts += 1;
      await otp.save();
      
      return {
        success: false,
        message: `OTP không đúng. Còn ${5 - otp.attempts} lần thử`,
        remainingAttempts: 5 - otp.attempts
      };
    }

    // Mark OTP as used
    otp.isUsed = true;
    await otp.save();

    console.log(`✅ OTP verified for ${phone}`);

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Clean up expired OTPs (called periodically)
 */
export const cleanupExpiredOTPs = async () => {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} expired OTPs`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
    throw error;
  }
};

export default {
  createOTP,
  verifyOTP,
  cleanupExpiredOTPs
};

