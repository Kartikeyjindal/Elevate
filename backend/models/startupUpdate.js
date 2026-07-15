const mongoose = require('mongoose');

const startupUpdateSchema = new mongoose.Schema({
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true
  },
  type: {
    type: String,
    enum: ['update', 'question'],
    default: 'update',
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorRole: {
    type: String,
    enum: ['founder', 'investor', 'admin'],
    default: 'founder'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StartupUpdate',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  answer: {
    type: String,
    default: ''
  },
  upvotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StartupUpdate', startupUpdateSchema);
