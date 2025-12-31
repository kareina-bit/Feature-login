export function saveOtp(phone, code) {
  sessionStorage.setItem("otp_" + phone, code);
}

export function getOtp(phone) {
  return sessionStorage.getItem("otp_" + phone);
}

export function clearOtp(phone) {
  sessionStorage.removeItem("otp_" + phone);
}

export function saveRole(phone, role) {
  sessionStorage.setItem("role_" + phone, role);
}

export function getRole(phone) {
  return sessionStorage.getItem("role_" + phone);
}

export function clearRole(phone) {
  sessionStorage.removeItem("role_" + phone);
}
