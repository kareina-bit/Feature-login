import { OTP, IOTP } from '../models/OTP.model';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client (if credentials are provided)
const twilioClient = accountSid && authToken 
  ? twilio(accountSid, authToken)
  : null;

const OTP_EXPIRE_MINUTES = parseInt(process.env.OTP_EXPIRE_MINUTES || '5', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);

/**
 * Generate random OTP code
 */
const generateOTP = (length: number = OTP_LENGTH): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Send OTP via SMS using Twilio
 */
const sendOTPSMS = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    if (!twilioClient || !twilioPhoneNumber) {
      // In development, log OTP instead of sending
      console.log(`📱 OTP for ${phoneNumber}: ${code}`);
      console.log('⚠️ Twilio not configured. OTP logged to console.');
      return true;
    }

    const message = await twilioClient.messages.create({
      body: `Mã xác thực Shipway của bạn là: ${code}. Mã có hiệu lực trong ${OTP_EXPIRE_MINUTES} phút.`,
      from: twilioPhoneNumber,
      to: phoneNumber
    });

    return message.sid ? true : false;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    return false;
  }
};

/**
 * Create and send OTP
 */
export const createAndSendOTP = async (
  phoneNumber: string,
  purpose: 'register' | 'login' | 'reset_password'
): Promise<{ success: boolean; message: string; otpId?: string }> => {
  try {
    // Check for recent unverified OTP
    const recentOTP = await OTP.findOne({
      phoneNumber,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    // Prevent spam: only allow new OTP if previous one is expired or verified
    if (recentOTP && recentOTP.expiresAt > new Date()) {
      const remainingSeconds = Math.ceil(
        (recentOTP.expiresAt.getTime() - Date.now()) / 1000
      );
      return {
        success: false,
        message: `Vui lòng đợi ${Math.ceil(remainingSeconds / 60)} phút trước khi yêu cầu mã mới`
      };
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    // Save OTP to database
    const otpRecord = new OTP({
      phoneNumber,
      code,
      purpose,
      expiresAt
    });
    await otpRecord.save();

    // Send OTP via SMS
    const sent = await sendOTPSMS(phoneNumber, code);

    if (!sent) {
      // If SMS fails, still save OTP but mark as failed
      return {
        success: false,
        message: 'Không thể gửi mã OTP. Vui lòng thử lại sau.'
      };
    }

    return {
      success: true,
      message: `Mã OTP đã được gửi đến số điện thoại ${phoneNumber}`,
      otpId: otpRecord._id.toString()
    };
  } catch (error: any) {
    console.error('Error creating OTP:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi tạo mã OTP'
    };
  }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (
  phoneNumber: string,
  code: string,
  purpose: 'register' | 'login' | 'reset_password'
): Promise<{ success: boolean; message: string; otpRecord?: IOTP }> => {
  try {
    // Find valid OTP
    const otpRecord = await OTP.findOne({
      phoneNumber,
      code,
      purpose,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return {
        success: false,
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn'
      };
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return {
        success: false,
        message: 'Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới'
      };
    }

    // Increment attempts
    otpRecord.attempts += 1;

    // Verify code
    if (otpRecord.code === code) {
      otpRecord.verified = true;
      await otpRecord.save();
      return {
        success: true,
        message: 'Mã OTP hợp lệ',
        otpRecord
      };
    } else {
      await otpRecord.save();
      return {
        success: false,
        message: 'Mã OTP không đúng'
      };
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi xác thực mã OTP'
    };
  }
};

/**
 * Clean up expired OTPs (optional, MongoDB TTL index handles this automatically)
 */
export const cleanupExpiredOTPs = async (): Promise<number> => {
  try {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
    return 0;
  }
};

