const express = require('express');
const router = express.Router();
const { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} = require('../controllers/subjectController');
const { authenticate } = require('../controllers/authController');

// Public routes
router.get('/', getAllSubjects);

// Protected routes (require admin password)
router.post('/', authenticate, createSubject);
router.put('/:id', authenticate, updateSubject);
router.delete('/:id', authenticate, deleteSubject);

module.exports = router;
