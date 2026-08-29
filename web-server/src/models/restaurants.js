const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { 
    lat: {type: Number, required: true },
    lng: { type: Number, required: true}
  },
  description: { type: String },
  type: { type: String },
  image: { type: String },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);