import { getUsers, saveUsers, findUser } from "./api.js";
import { saveOtp, getOtp, clearOtp } from "./auth.state.js";

export function registerUser({ phone, name, password }) {
  if (findUser(phone)) throw "Tài khoản đã tồn tại";
  const users = getUsers();
  users.push({ phone, name, password });
  saveUsers(users);
}

export function loginUser(phone, password) {
  const user = findUser(phone);
  if (!user) throw "Tài khoản không tồn tại";
  if (user.password !== password) throw "Sai mật khẩu";
  return user;
}

export function sendOtp(phone, opts = {}) {
  const { requireUser = false } = opts;
  const user = findUser(phone);
  if (requireUser && !user) throw "Tài khoản không tồn tại";

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  saveOtp(phone, otp);
  console.log(`OTP for ${phone}: ${otp}`);
  return true;
}

export function verifyOtp(phone, otp) {
  const savedOtp = getOtp(phone);
  if (!savedOtp || savedOtp !== otp) throw "Mã OTP không đúng";
  return true;
}

export function resetPassword(phone, otp, newPassword) {
  const user = findUser(phone);
  if (!user) throw "Tài khoản không tồn tại";
  
  const savedOtp = getOtp(phone);
  if (!savedOtp || savedOtp !== otp) throw "Mã OTP không đúng";
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.phone === phone);
  users[userIndex].password = newPassword;
  saveUsers(users);
  clearOtp(phone);
  return true;
}
