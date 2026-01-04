const Subject = require('../models/Subject');
const Material = require('../models/Material');

// Get all subjects with material counts
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .sort({ name: 1 })
      .select('code name description icon color materialsCount');
    
    // If no subjects in database, return default ones
    if (subjects.length === 0) {
      const defaultSubjects = [
        { code: 'mathematics', name: 'Mathematics', description: 'Algebra, Geometry, Calculus', icon: 'calculator', color: '#e74c3c', materialsCount: 12 },
        { code: 'science', name: 'Science', description: 'Biology, Chemistry, Physics', icon: 'flask', color: '#3498db', materialsCount: 15 },
        { code: 'english', name: 'English', description: 'Literature, Writing, Grammar', icon: 'book-open', color: '#2ecc71', materialsCount: 9 },
        { code: 'history', name: 'History', description: 'World History, Geography, Civics', icon: 'landmark', color: '#f39c12', materialsCount: 11 },
        { code: 'art', name: 'Art & Music', description: 'Visual arts, Music theory', icon: 'palette', color: '#9b59b6', materialsCount: 7 },
        { code: 'language', name: 'Foreign Languages', description: 'Spanish, French, German', icon: 'language', color: '#1abc9c', materialsCount: 8 }
      ];
      
      // Insert default subjects if none exist
      await Subject.insertMany(defaultSubjects);
      
      return res.status(200).json({
        success: true,
        count: defaultSubjects.length,
        subjects: defaultSubjects
      });
    }
    
    res.status(200).json({
      success: true,
      count: subjects.length,
      subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects'
    });
  }
};

// Create new subject
const createSubject = async (req, res) => {
  try {
    const { code, name, description, icon, color } = req.body;
    
    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code: code.toLowerCase() });
    
    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this code already exists'
      });
    }
    
    const subject = new Subject({
      code: code.toLowerCase(),
      name,
      description,
      icon: icon || 'book',
      color: color || '#4a6fa5'
    });
    
    await subject.save();
    
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subject'
    });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const subject = await Subject.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subject'
    });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if subject has materials
    const materialCount = await Material.countDocuments({ subject: id, isActive: true });
    
    if (materialCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject with existing materials'
      });
    }
    
    const subject = await Subject.findByIdAndDelete(id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subject'
    });
  }
};

module.exports = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};