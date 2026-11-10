const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// Protect all settings routes
router.use(protect);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;

