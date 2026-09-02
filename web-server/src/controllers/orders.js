const restaurants = require('../models/restaurants');
const orderService = require('../services/orders');
const productService = require('../services/products');
const restaurantService = require('../services/restaurants');
const tcpClient = require('../tcpClient');

const getOrders = async (req, res) => {
    try {
        const authUserId = req.user.userId;
        const orders = await orderService.getOrders(authUserId);
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
        const address = req.user.address || 'Address on file'; // new
        const { restaurantId, products } = req.body;
        if (!restaurantId) {
            return res.status(500).json({ error: 'restaurantId is required' });
        }

        const restaurant = await restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const validatedProducts = [];
        let calculatedTotal = 0;

        // checking if products are from the restaurant
        for(let p of products) {
            const productInfo = await productService.getProductById(p.productId);

            if (!productInfo) {
                return res.status(404).json({ error: `Product ${p.productId} not found` });
            }
            if (productInfo.restaurantId !== restaurantId) {
                return res.status(400).json({ error: `Product ${productInfo.name} does not belong to the selected restaurant` });
            }

            validatedProducts.push({
                productId: p.productId,
                productName: productInfo.name,
                price: productInfo.price,
                quantity: p.quantity
            });

            calculatedTotal += (productInfo.price * p.quantity);
        }
        const orderData = {
            ...req.body,
            restaurantName: restaurant.name,
            userId: authUserId,
            totalPrice: calculatedTotal,
            address: address || 'Address on file',
            products: validatedProducts
        };
        const order = await orderService.createOrder(orderData);
        const productIds = order.products.map(p => p.productId);

        if (productIds.length > 0) {
            const cmd = `ADD_PURCHASE ${order.userId} ${productIds.join(' ')}`;
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

        const existingOrder = await orderService.getOrderById(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (existingOrder.userId !== authUserId) {
            return res.status(403).json({ error: 'Access denied. You can only update your own orders.' });
        }
        delete req.body.userId;

        const order = await orderService.updateOrder(id, req.body);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const authUserId = req.user.userId;

        const existingOrder = await orderService.getOrderById(id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        if (existingOrder.userId !== authUserId) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own orders.' });
        }
        
        const order = await orderService.deleteOrder(id);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await orderService.updateOrderStatus(id, status);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
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
    deleteOrder,
    getAllOrders,
    updateOrderStatus
}