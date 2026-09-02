const restaurantModel = require('../models/restaurants');

const getRestaurants = async () => {
    return await restaurantModel.find();
}

const getRestaurantById = async (id) => {
    return await restaurantModel.findById(id);
}

const createRestaurant = async (restaurantData) => {
    const newRestaurant = new restaurantModel(restaurantData);
    return await newRestaurant.save();
}

const updateRestaurant = async (id, restaurantData) => {
    return await restaurantModel.findByIdAndUpdate(id, restaurantData, { returnDocument: 'after', runValidators: true });
}

const deleteRestaurant = async (id) => {
    return await restaurantModel.findByIdAndDelete(id);
}

const searchRestaurants = async (query) => {
    const restaurants = await restaurantModel.find({ name: { $regex: query, $options: 'i'}});
    return restaurants;
}

module.exports = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    searchRestaurants
}