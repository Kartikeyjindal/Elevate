const mongoose = require('./mockMongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'investor', 'company'],
    default: 'investor',
    required: true
  },
  walletBalance: {
    type: Number,
    default: 100000,
    required: true
  },
  portfolio: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  }],
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup'
  },
  address: {
    type: String,
    default: ''
  },
  dob: {
    type: String,
    default: ''
  },
  panCard: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
