const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    products: { type: [{
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, default: 1}
    }], required: true },
    description: { type: String },
    status: { type: String, default: 'In Progress'},
    orderTime: { type: Date , default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);