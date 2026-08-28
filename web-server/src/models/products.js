const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true},
  name: { type: String, required: true, unique: true},
  description: { type: String, required: true },
  price: { type: Number, required: true, min: [0.1, 'Price must be greater than 0'] },
  calories: { type: Number, min: [0, 'Calories cannot be negative'] },
  limited: { type: Boolean ,default: false},
  image: { type: String },
});

module.exports = mongoose.model('Product', productSchema);