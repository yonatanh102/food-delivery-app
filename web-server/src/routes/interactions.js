const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactions');

router.post('/view', interactionController.addView);
router.delete('/view', interactionController.removeView);
router.post('/purchase', interactionController.addPurchase);
router.delete('/purchase', interactionController.removePurchase);

module.exports = router;