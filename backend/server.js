require('dotenv').config();
const express = require('express');
const mongoose = require('./models/mockMongoose');
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

// Test root route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Crowdfunding platform backend is healthy' });
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crowdfunding')
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    try {
      const seedDatabase = require('./seed');
      await seedDatabase();
      console.log('Mock database auto-seeded successfully.');
    } catch (err) {
      console.error('Failed to auto-seed mock database:', err);
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
