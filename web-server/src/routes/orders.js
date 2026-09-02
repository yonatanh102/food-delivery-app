const express = require ('express');
const router = express.Router();
const orderController = require('../controllers/orders');

const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/admin');


// all route are private
router.use(verifyToken);

// admin routes
router.get('/all', verifyAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyAdmin, orderController.updateOrderStatus);

// user routes
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
