const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/codeController');

// Code execution route
router.post('/execute', executeCode);

module.exports = router; 