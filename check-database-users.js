// Script để check users trong database
// Chạy: node check-database-users.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipway_driver';

const UserSchema = new mongoose.Schema({
  phoneNumber: String,
  phoneNumberVerified: Boolean,
  fullName: String,
  email: String,
  role: String,
  status: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Count total users
    const count = await User.countDocuments();
    console.log(`📊 Total users in database: ${count}\n`);
    
    // Get all users
    const users = await User.find().select('phoneNumber fullName email role status createdAt').limit(20);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 You need to register a user first via /api/v1/auth/register');
    } else {
      console.log('👥 Users in database:');
      console.log('─'.repeat(80));
      users.forEach((user, index) => {
        console.log(`${index + 1}. Phone: ${user.phoneNumber}`);
        console.log(`   Name: ${user.fullName || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('─'.repeat(80));
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();

