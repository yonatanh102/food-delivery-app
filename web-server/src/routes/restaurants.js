const express = require ('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurants');

const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/admin');

// public routes
router.get('/', restaurantController.getRestaurants);
router.get('/search', restaurantController.searchRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// private routes
router.post('/', verifyToken, verifyAdmin, restaurantController.createRestaurant);
router.put('/:id', verifyToken, verifyAdmin, restaurantController.updateRestaurant);
router.delete('/:id', verifyToken, verifyAdmin, restaurantController.deleteRestaurant);

module.exports = router;
