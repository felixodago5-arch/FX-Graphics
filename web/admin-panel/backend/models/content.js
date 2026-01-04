const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['image', 'video', 'motion-graphic', 'document'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnail: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  carouselPosition: Number,
  metadata: {
    size: Number,
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // for videos
    format: String
  },
  stats: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'client-only'],
    default: 'public'
  },
  accessibleTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('Content', contentSchema);