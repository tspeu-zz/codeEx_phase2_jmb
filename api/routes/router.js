/**
 * Express Router configuration
 */
const express = require('express');
const router = express.Router();

/* API routes */
router.use('/matching', require('./matchingRoutes'));

module.exports = router;