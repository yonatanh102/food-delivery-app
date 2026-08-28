const orderModel = require('../models/orders');

const getOrders = async () => {
    return await orderModel.find();
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

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
}