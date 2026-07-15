require('dotenv').config();
const express = require('express');
let mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check — always responds, even before DB connects
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';
  res.status(200).json({ status: 'OK', db: dbStatus });
});

// Middleware to ensure DB connection is active for all API requests
app.use((req, res, next) => {
  const state = mongoose.connection.readyState;
  
  if (state === 1) {
    return next();
  }
  
  if (state === 2) {
    // If database is currently connecting, wait up to 3 seconds for it to finish
    let resolved = false;
    
    const onConnected = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        cleanup();
        next();
      }
    };
    
    const onError = (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        cleanup();
        res.status(503).json({
          error: 'Database connection is initializing but failed. Please reload the page in a few seconds.'
        });
      }
    };
    
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        res.status(503).json({
          error: 'Database connection is taking longer than expected. Please reload the page in a few seconds.'
        });
      }
    }, 3000);
    
    const cleanup = () => {
      mongoose.connection.off('connected', onConnected);
      mongoose.connection.off('error', onError);
    };
    
    mongoose.connection.once('connected', onConnected);
    mongoose.connection.once('error', onError);
    return;
  }
  
  // Disconnected (0) or Disconnecting (3)
  return res.status(503).json({
    error: 'Database is currently offline. Please try again in a few moments.'
  });
});

// Start HTTP server first so Render's health check passes immediately
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfunding';

const initializeAndStart = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,  // 2 second timeout per attempt
      socketTimeoutMS: 10000,
    });
    console.log('Successfully connected to MongoDB.');

    // Run idempotent seed (only seeds if DB is empty)
    try {
      const seedDatabase = require('./seed');
      await seedDatabase();
      console.log('Database seed check complete.');
    } catch (err) {
      console.error('Seed error (non-fatal):', err.message);
    }

  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('--- FALLING BACK TO IN-MEMORY SIMULATED STORAGE ---');

    // Swapping require.cache for mongoose with mockMongoose
    const mockMongoose = require('./models/mockMongoose');
    require.cache[require.resolve('mongoose')] = {
      id: require.resolve('mongoose'),
      filename: require.resolve('mongoose'),
      loaded: true,
      exports: mockMongoose
    };

    mongoose = mockMongoose;
    await mongoose.connect();

    // Run seed checking on mock DB
    try {
      const seedDatabase = require('./seed');
      await seedDatabase();
      console.log('Mock database seed check complete.');
    } catch (seedErr) {
      console.error('Mock seed error (non-fatal):', seedErr.message);
    }
  }

  // Import routes AFTER database setup is complete so they bind to the correct mongoose instance
  const authRoutes = require('./routes/auth');
  const startupRoutes = require('./routes/startups');
  const adminRoutes = require('./routes/admin');
  const investmentRoutes = require('./routes/investments');
  const blogRoutes = require('./routes/blogs');
  const watchlistRoutes = require('./routes/watchlist');
  const updatesRoutes = require('./routes/updates');

  // Routes registration
  app.use('/api/auth', authRoutes);
  app.use('/api/startups', startupRoutes);
  app.use('/api/startups', updatesRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', investmentRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/watchlist', watchlistRoutes);
  console.log('API Routes successfully registered.');
};

initializeAndStart();
