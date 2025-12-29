export function saveOtp(phone, code) {
  sessionStorage.setItem("otp_" + phone, code);
}

export function getOtp(phone) {
  return sessionStorage.getItem("otp_" + phone);
}

export function clearOtp(phone) {
  sessionStorage.removeItem("otp_" + phone);
}
