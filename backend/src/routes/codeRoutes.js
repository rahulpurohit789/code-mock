const express = require('express');
const router = express.Router();
const { executeCode, generateSkeletonCode } = require('../controllers/codeController');

// Code execution route
router.post('/execute', executeCode);

// Skeleton code generation route
router.post('/generate-skeleton', generateSkeletonCode);

module.exports = router; 