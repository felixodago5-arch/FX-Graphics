const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const { auth, adminAuth } = require('../middleware/auth');

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, createdAt: -1 });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, coverImage, order, parentCategory } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const category = new Category({
      name,
      slug,
      description,
      coverImage,
      order: order || 0,
      parentCategory
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category name or slug already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Generate slug if name is being updated
    if (updates.name && !updates.slug) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

module.exports = router;

