const express = require('express');
const router = express.Router();
const multer = require('multer');
const Content = require('../models/content');
const Category = require('../models/category');
const { auth, adminAuth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    if (file.mimetype.startsWith('image/')) folder += 'images/';
    else if (file.mimetype.startsWith('video/')) folder += 'videos/';
    else folder += 'files/';
    
    // Ensure directory exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm|pdf|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Allowed: images, videos, documents'));
  }
});

// Upload content
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, tags, visibility, featured, carouselPosition } = req.body;
    
    // Determine content type
    let contentType = 'document';
    if (req.file.mimetype.startsWith('image/')) contentType = 'image';
    else if (req.file.mimetype.startsWith('video/')) contentType = 'video';
    else if (req.file.mimetype.includes('gif') || req.file.mimetype.includes('animation')) contentType = 'motion-graphic';
    
    const content = new Content({
      title: title || req.file.originalname,
      description: description || '',
      type: contentType,
      fileUrl: `/uploads/${req.file.path.replace(/\\/g, '/').replace('uploads/', '')}`,
      thumbnail: contentType === 'image' ? `/uploads/${req.file.path.replace(/\\/g, '/').replace('uploads/', '')}` : null,
      category: category || null,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      visibility: visibility || 'public',
      featured: featured === 'true' || featured === true,
      carouselPosition: carouselPosition ? parseInt(carouselPosition) : null,
      uploadedBy: req.userId,
      metadata: {
        size: req.file.size,
        format: req.file.mimetype,
        originalName: req.file.originalname
      }
    });
    
    await content.save();
    await content.populate('category', 'name slug');
    await content.populate('uploadedBy', 'email profile.name');
    
    res.status(201).json(content);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get all content with filters
router.get('/', auth, async (req, res) => {
  try {
    const { category, type, featured, page = 1, limit = 20, search } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (featured !== undefined) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const contents = await Content.find(query)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'email profile.name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ uploadedAt: -1 });
    
    const total = await Content.countDocuments(query);
    
    res.json({
      contents,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single content item
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'email profile.name');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update content
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = new Date();
    
    // Convert string booleans
    if (updates.featured !== undefined) {
      updates.featured = updates.featured === 'true' || updates.featured === true;
    }
    
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('category', 'name slug')
      .populate('uploadedBy', 'email profile.name');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Delete file from filesystem
    if (content.fileUrl) {
      const filePath = path.join(__dirname, '..', content.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

module.exports = router;
