const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Testimonial = require('./Testimonial'); // import model
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB Error:', err));

// API endpoints

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Add new testimonial
app.post('/api/testimonials', async (req, res) => {
  try {
    const newTestimonial = new Testimonial(req.body);
    await newTestimonial.save();
    res.json({ success: true, testimonial: newTestimonial });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

// Delete testimonial
app.delete('/api/testimonials/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Update testimonial
app.put('/api/testimonials/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../testimonials.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

