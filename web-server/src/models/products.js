const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  resturantId: { type: String, required: true},
  name: { type: String, required: true, unique: true},
  description: { type: String, required: true },
  price: { type: Number, required: true },
  calories: { type: Number },
  limited: { type: Boolean ,default: 'false'},
  image: { type: String },
});

module.exports = mongoose.model('Product', productSchema);