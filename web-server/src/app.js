const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const recommendationRoutes = require('./routes/recommendations');
const interactionRoutes = require('./routes/interactions');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const restaurantsRoutes = require('./routes/restaurants');
const ordersRoutes = require('./routes/orders');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/interactions', interactionRoutes);
app.use('/restaurants', restaurantsRoutes);
app.use('/orders', ordersRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery_db';

if (!process.env.NODE_ENV || process.env.NODE_ENV.trim() !== 'test') {
  mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
  console.log(`Web server is running on port ${PORT}`);
  });
}

module.exports = app;