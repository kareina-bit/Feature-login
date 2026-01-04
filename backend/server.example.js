/**
 * Example local test server for quick testing
 * Run with: node server.example.js
 * 
 * This is a simplified version without MongoDB
 * for frontend development and testing
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001; // Different port to not conflict with main server

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (resets on restart)
const users = [];
const otps = {};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Example server is running (no MongoDB)',
    timestamp: new Date().toISOString()
  });
});

// Send OTP (mock)
app.post('/api/auth/send-otp', (req, res) => {
  const { phone, purpose } = req.body;
  
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otps[phone] = { otp, purpose, expiresAt: Date.now() + 5 * 60 * 1000 };

  console.log(`📱 OTP for ${phone}: ${otp}`);

  res.json({ 
    success: true, 
    message: 'OTP sent',
    otp, // Return OTP in development
    expiresAt: new Date(otps[phone].expiresAt)
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { phone, name, password, role, otp } = req.body;

  if (!phone || !name || !password || !otp) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  // Verify OTP
  if (!otps[phone] || otps[phone].otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  // Check if user exists
  if (users.find(u => u.phone === phone)) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = {
    id: users.length + 1,
    phone,
    name,
    password, // In real app, this would be hashed
    role: role || 'user',
    createdAt: new Date()
  };

  users.push(user);
  delete otps[phone];

  console.log(`✅ User registered: ${phone}`);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token: 'mock_jwt_token_' + user.id,
    user: { ...user, password: undefined }
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password required' });
  }

  const user = users.find(u => u.phone === phone && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  console.log(`✅ User logged in: ${phone}`);

  res.json({
    success: true,
    message: 'Login successful',
    token: 'mock_jwt_token_' + user.id,
    user: { ...user, password: undefined }
  });
});

// Reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }

  // Verify OTP
  if (!otps[phone] || otps[phone].otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  const user = users.find(u => u.phone === phone);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.password = newPassword;
  delete otps[phone];

  console.log(`✅ Password reset: ${phone}`);

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// Get current user (mock - no real auth)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token || !token.startsWith('mock_jwt_token_')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const userId = parseInt(token.replace('mock_jwt_token_', ''));
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    user: { ...user, password: undefined }
  });
});

app.listen(PORT, () => {
  console.log(`🧪 Example server running on http://localhost:${PORT}`);
  console.log(`⚠️  This is a MOCK server for testing only`);
  console.log(`📝 Data will be lost on restart`);
  console.log(`\nTest with:`);
  console.log(`  curl http://localhost:${PORT}/api/health`);
});

