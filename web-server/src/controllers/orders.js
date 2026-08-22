const restaurants = require('../models/restaurants');
const orderService = require('../services/orders');
const productService = require('../services/products');
const restaurantService = require('../services/restaurants');
const tcpClient = require('../tcpClient');

const getOrders = async (req, res) => {
    try {
        const orders = await orderService.getOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params; 
        const order = await orderService.getOrderById(id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

// creating new order and sending purchased items to the cpp server
const createOrder = async (req, res) => {
    try {
        const authUserId = req.user.userId;
        const { restaurantId, products } = req.body;

        const restaurant = await restaurantService.getRestaurandById(restaurantId);
        
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        // checking if products are from the restaurant
        for(let p of products) {
            const productInfo = await productService.getProductById(p.productId);

            if (!productInfo) {
                return res.status(404).json({ error: `Product ${p.productId} not found` });
            }
            if (productInfo.restaurantId !== restaurantId) {
                return res.status(400).json({ error: `Product ${productInfo.name} does not belong to the selected restaurant` });
            }
        }
        const orderData = {
            ...req.body,
            restaurantName: restaurant.name,
            userId: authUserId
        };
        const order = await orderService.createOrder(req.body);
        const products = order.products.map(p => p.productId);

        if (products.length > 0) {
            const cmd = `ADD_PURCHASE ${order.userId} ${products.join(' ')}`;
            tcpClient.sendCommand(cmd).catch(err => {
                console.error('[TCP Error] Failed to report purchase:', err.message);
            });
        }
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const authUserId = req.user.userId;
        const order = await orderService.updateOrder(id, req.body);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.userId !== authUserId) {
            return res.status(403).json({ error: 'Access denied. You can only update your own orders.' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const authUserId = req.user.userId;
        const order = await orderService.deleteOrder(id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (order.userId !== authUserId) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own orders.' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
}