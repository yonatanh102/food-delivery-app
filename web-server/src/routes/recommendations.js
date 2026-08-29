const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendations');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, recommendationController.getRecommendations);

module.exports = router;