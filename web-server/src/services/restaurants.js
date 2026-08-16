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
    return await restaurantModel.findByIdAndUpdate(id, restaurantData, { new: true });
}

const deleteRestaurant = async (id) => {
    return await restaurantModel.findByIdAndDelete(id);
}

module.exports = {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
}