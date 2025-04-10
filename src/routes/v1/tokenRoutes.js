const express = require('express');
const router = express.Router();
const tokenController = require('../../controllers/tokenController');

// Route to generate Agora RTC token
router.post('/token', tokenController.generateRtcToken);

module.exports = router;