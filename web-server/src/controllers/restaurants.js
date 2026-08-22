const restaurantService = require('../services/restaurants');

const getRestaurants = async (req, res) => {
    try {
        const restaurants = await restaurantService.getRestaurants();
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantService.getRestaurantById(id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(200).json(restaurant) 
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const searchRestaurants = async (req, res) => {
    try {
        const searchQuery = req.query.q;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Search query is missing' });
        }

        const restaurants = await restaurantService.find({ name: { $regex: searchQuery, $options: 'i'}});
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const createRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantService.createRestaurant(req.body);
        res.status(201).json(restaurant)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantService.updateRestaurant(id, req.body);
        
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(200).json(restaurant)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await restaurantService.deleteRestaurant(id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.status(200).json(restaurant)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};

module.exports = {
    getRestaurants,
    getRestaurantById,
    searchRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
}