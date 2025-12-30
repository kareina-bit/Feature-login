import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * Validate and format Vietnamese phone number
 * @param phoneNumber - Phone number to validate
 * @returns Formatted phone number in E.164 format or null if invalid
 */
export const validateVietnamesePhone = (phoneNumber: string): string | null => {
  try {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // If starts with 0, replace with +84
    let formatted = cleaned;
    if (cleaned.startsWith('0')) {
      formatted = '+84' + cleaned.substring(1);
    } else if (cleaned.startsWith('84')) {
      formatted = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      formatted = '+84' + cleaned;
    }
    
    // Validate phone number
    if (!isValidPhoneNumber(formatted, 'VN' as CountryCode)) {
      return null;
    }
    
    // Parse and return in E.164 format
    const parsed = parsePhoneNumber(formatted, 'VN' as CountryCode);
    return parsed.format('E.164');
  } catch (error) {
    return null;
  }
};

/**
 * Check if phone number is Vietnamese
 */
export const isVietnamesePhone = (phoneNumber: string): boolean => {
  try {
    const formatted = validateVietnamesePhone(phoneNumber);
    if (!formatted) return false;
    
    const parsed = parsePhoneNumber(formatted, 'VN' as CountryCode);
    return parsed.country === 'VN';
  } catch (error) {
    return false;
  }
};

/**
 * Format phone number for display (Vietnamese format)
 */
export const formatPhoneForDisplay = (phoneNumber: string): string => {
  try {
    const formatted = validateVietnamesePhone(phoneNumber);
    if (!formatted) return phoneNumber;
    
    const parsed = parsePhoneNumber(formatted, 'VN' as CountryCode);
    // Format as: 0xxx xxx xxx
    const national = parsed.nationalNumber;
    if (national.length === 9) {
      return `0${national.substring(0, 3)} ${national.substring(3, 6)} ${national.substring(6)}`;
    }
    return parsed.formatNational();
  } catch (error) {
    return phoneNumber;
  }
};

