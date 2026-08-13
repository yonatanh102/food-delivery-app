const express = require('express');
const mongoose = require('mongoose');

const recommendationRoutes = require('./routes/recommendations');
const interactionRoutes = require('./routes/interactions');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/interactions', interactionRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});