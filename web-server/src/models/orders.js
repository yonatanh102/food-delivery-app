const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    restaurantId: { type: String, required: true },
    restaurantName: { type: String, required: true },
    address: { type: String, required: true },
    products: { type: [{
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, default: 1, min: [1, 'Quantity must be at least 1']},
        price: { type: Number, required: true, min: [0, 'Price must be a positive number'] }
    }], required: true },
    description: { type: String },
    status: { type: String, default: 'pending'},
    orderTime: { type: Date , default: Date.now },
    totalPrice: { type: Number, required: true, min: [0, 'Total price must be a positive number'] }
}, { timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);