const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactions');
const verifyToken = require('../middleware/auth');

router.post('/view', verifyToken, interactionController.addView);
router.delete('/view', verifyToken, interactionController.removeView);
router.post('/purchase', verifyToken, interactionController.addPurchase);
router.delete('/purchase', verifyToken, interactionController.removePurchase);

module.exports = router;