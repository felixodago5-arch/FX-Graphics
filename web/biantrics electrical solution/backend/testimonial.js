const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 },
  avatar: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);