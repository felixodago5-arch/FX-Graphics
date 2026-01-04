const express = require('express');
const router = express.Router();
const { 
  getAllMaterials, 
  getMaterialsBySubject, 
  uploadMaterial, 
  deleteMaterial 
} = require('../controllers/materialController');
const { authenticate } = require('../controllers/authController');
const upload = require('../config/upload');

// Public routes
router.get('/', getAllMaterials);
router.get('/subject/:subject', getMaterialsBySubject);

// Protected routes (require admin password)
router.post('/upload', authenticate, upload.single('file'), uploadMaterial);
router.delete('/:id', authenticate, deleteMaterial);

module.exports = router;
