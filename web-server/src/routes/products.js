const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/admin');

// public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// private routes
router.post('/', verifyToken, verifyAdmin, productController.createProduct);
router.put('/:id', verifyToken, verifyAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;