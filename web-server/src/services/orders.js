const orderModel = require('../models/orders');

const getOrders = async (userId) => {
    return await orderModel.find({ userId });
}

const getOrderById = async (id) => {
    return await orderModel.findById(id);
}

const createOrder = async (orderData) => {
    const newOrder = new orderModel(orderData);
    return await newOrder.save();
}

const updateOrder = async (id, orderData) => {
    return await orderModel.findByIdAndUpdate(id, orderData, { returnDocument: 'after', runValidators: true });
}

const deleteOrder = async (id) => {
    return await orderModel.findByIdAndDelete(id);
}

const getAllOrders = async () => {
    return await orderModel.find().sort({ createdAt: -1});
}

const updateOrderStatus = async (id, status) => {
    return await orderModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after', runValidators: true });
}

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getAllOrders,
    updateOrderStatus
}