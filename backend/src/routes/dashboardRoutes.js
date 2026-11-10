const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protect all dashboard routes
router.use(protect);

router.get('/summary', getDashboardSummary);

module.exports = router;
