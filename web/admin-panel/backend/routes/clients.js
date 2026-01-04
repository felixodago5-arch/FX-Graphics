const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { auth, adminAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all clients (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const query = { role: 'client' };
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.name': { $regex: search, $options: 'i' } },
        { 'profile.company': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const clients = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      clients,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single client
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const client = await User.findOne({ _id: req.params.id, role: 'client' }).select('-password');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create client
router.post('/', adminAuth, async (req, res) => {
  try {
    const { email, password, name, company, phone, type, preferences } = req.body;
    
    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const client = new User({
      email: email.toLowerCase(),
      password: password || undefined,
      role: 'client',
      type: type || 'guest',
      profile: {
        name,
        company,
        phone,
        preferences: preferences || { notifications: true, theme: 'light' }
      }
    });
    
    await client.save();
    
    const clientData = client.toObject();
    delete clientData.password;
    
    res.status(201).json(clientData);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Failed to create client', error: error.message });
  }
});

// Update client
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Don't allow role changes through this endpoint
    delete updates.role;
    
    // Hash password if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const client = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'client' },
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Failed to update client', error: error.message });
  }
});

// Delete client
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const client = await User.findOneAndDelete({ _id: req.params.id, role: 'client' });
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Failed to delete client', error: error.message });
  }
});

module.exports = router;

