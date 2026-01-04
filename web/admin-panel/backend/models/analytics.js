const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  eventType: {
    type: String,
    enum: ['view', 'click', 'download', 'share', 'login', 'search'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  page: String,
  referrer: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet']
  },
  browser: String,
  os: String,
  location: {
    country: String,
    city: String,
    ip: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  duration: Number, // Time spent in seconds
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Analytics', analyticsSchema);