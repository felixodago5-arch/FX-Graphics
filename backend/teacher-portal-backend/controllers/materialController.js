const Material = require('../models/Admin');
const fs = require('fs');
const path = require('path');

// Get all materials
const getAllMaterials = async (req, res) => {
  try {
    const { subject, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Filter by subject
    if (subject) {
      query.subject = subject;
    }
    
    // Search by title or description
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (page - 1) * limit;
    
    const materials = await Material.find(query)
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Material.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: materials.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      materials
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching materials'
    });
  }
};

// Get materials by subject
const getMaterialsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    
    const materials = await Material.find({ 
      subject: subject,
      isActive: true 
    })
    .sort({ uploadDate: -1 })
    .select('title fileType fileSize uploadDate downloadCount');
    
    // Get subject details (you could fetch from Subject model)
    const subjectMap = {
      mathematics: { name: 'Mathematics', icon: 'calculator' },
      science: { name: 'Science', icon: 'flask' },
      english: { name: 'English', icon: 'book-open' },
      history: { name: 'History', icon: 'landmark' },
      art: { name: 'Art & Music', icon: 'palette' },
      language: { name: 'Foreign Languages', icon: 'language' }
    };
    
    const subjectInfo = subjectMap[subject] || { name: subject, icon: 'book' };
    
    res.status(200).json({
      success: true,
      subject: subjectInfo,
      count: materials.length,
      materials
    });
  } catch (error) {
    console.error('Get subject materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching materials for subject'
    });
  }
};

// Upload new material
const uploadMaterial = async (req, res) => {
  try {
    const { title, subject, description, tags } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Validate subject
    const validSubjects = ['mathematics', 'science', 'english', 'history', 'art', 'language'];
    if (!validSubjects.includes(subject)) {
      // Delete uploaded file if subject is invalid
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid subject'
      });
    }
    
    // Get subject name
    const subjectMap = {
      mathematics: 'Mathematics',
      science: 'Science',
      english: 'English',
      history: 'History',
      art: 'Art & Music',
      language: 'Foreign Languages'
    };
    
    // Create material record
    const material = new Material({
      title,
      filename: file.filename,
      originalName: file.originalname,
      fileType: path.extname(file.originalname).substring(1).toLowerCase(),
      fileSize: file.size,
      filePath: file.path,
      subject,
      subjectName: subjectMap[subject] || subject,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    await material.save();
    
    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material: {
        id: material._id,
        title: material.title,
        filename: material.filename,
        fileType: material.fileType,
        fileSize: material.fileSize,
        subject: material.subject,
        uploadDate: material.uploadDate
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error uploading material',
      error: error.message
    });
  }
};

// Download material
const downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    // Increment download count
    await material.incrementDownload();
    
    // Send file for download
    res.download(material.filePath, material.originalName, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });
  } catch (error) {
    console.error('Download controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
};

// Delete material
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const material = await Material.findById(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    
    // Delete file from filesystem
    if (fs.existsSync(material.filePath)) {
      fs.unlinkSync(material.filePath);
    }
    
    // Delete from database
    await Material.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting material'
    });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialsBySubject,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial
};