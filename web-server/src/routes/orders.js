const express = require ('express');
const router = express.Router();
const orderController = require('../controllers/orders');

const verifyToken = require('../middleware/auth');

// all route are private
router.use(verifyToken);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
