const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendations');

router.get('/', recommendationController.getRecommendations);

module.exports = router;