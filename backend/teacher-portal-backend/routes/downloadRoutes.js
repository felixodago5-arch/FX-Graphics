const express = require('express');
const router = express.Router();
const { downloadMaterial } = require('../controllers/materialController');

// Public download route
router.get('/:id', downloadMaterial);

module.exports = router;
