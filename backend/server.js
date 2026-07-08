require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const startupRoutes = require('./routes/startups');
const adminRoutes = require('./routes/admin');
const investmentRoutes = require('./routes/investments');
const blogRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', investmentRoutes);
app.use('/api/blogs', blogRoutes);

// Health check — always responds, even before DB connects
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  res.status(200).json({ status: 'OK', db: dbStatus });
});

// Start HTTP server first so Render's health check passes immediately
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Database connection — async, does NOT block server startup
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfunding';

const connectWithRetry = async (attempt = 1) => {
  const MAX_RETRIES = 5;
  try {
    console.log(`MongoDB connection attempt ${attempt}/${MAX_RETRIES}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,  // 10 second timeout per attempt
      socketTimeoutMS: 45000,
    });
    console.log('Successfully connected to MongoDB Atlas.');

    // Run idempotent seed (only seeds if DB is empty)
    try {
      const seedDatabase = require('./seed');
      await seedDatabase();
      console.log('Database seed check complete.');
    } catch (err) {
      console.error('Seed error (non-fatal):', err.message);
    }

  } catch (err) {
    console.error(`MongoDB connection failed (attempt ${attempt}):`, err.message);
    if (attempt < MAX_RETRIES) {
      const delay = attempt * 3000; // 3s, 6s, 9s, 12s backoff
      console.log(`Retrying in ${delay / 1000}s...`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    } else {
      console.error('All MongoDB connection attempts failed. Server continues without DB — API calls will fail gracefully.');
    }
  }
};

connectWithRetry();
