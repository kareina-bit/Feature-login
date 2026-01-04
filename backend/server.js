import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import { errorHandler } from './src/middleware/error.middleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5500',
      'http://localhost:5501',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:5501',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Shipway API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

export default app;

