const mongoose = require('mongoose');

const Restaurants = require('./models/restaurants');
const Products = require('./models/products');
const Users = require('./models/users');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery_db';
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB...');

        await Restaurants.deleteMany({});
        await Products.deleteMany({});
        console.log('Cleared old restaurants and products...');

        await Users.deleteMany({});
        console.log('Cleared old users...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = {
            name: 'Admin',
            email: 'admin@food.com',
            password: hashedPassword,
            phone: '1234567890',
            address: 'Admin Address',
            location: { lat: 32.0853, lng: 34.7818 },
            role: 'admin'
        };
        
        await Users.create(adminUser);
        console.log('Admin user created!');

        const restaurants = await Restaurants.insertMany([
            {
                name: 'Burger King',
                description: 'The best flame-grilled burgers in town with our secret sauce.',
                address: '123 Main St, City Center',
                location: { lat: 32.0853, lng: 34.7818 },
                logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80',
                banner: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1200&q=80'
            },
            {
                name: 'Sushi Mushi',
                description: 'Fresh sushi, sashimi, and authentic Japanese cuisine.',
                address: '45 Ocean Drive, Beachfront',
                location: { lat: 32.0900, lng: 34.7700 },
                logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
                banner: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=80'
            },
            {
                name: 'Pizza Hut',
                description: 'Wood-fired pizzas made with fresh, local ingredients.',
                address: '88 Italian Alley, Old Town',
                location: { lat: 32.0700, lng: 34.7900 },
                logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
                banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80'
            },
            {
                name: 'Mexicani',
                description: 'The best Mexican food in town!',
                address: '67 street, Tel Aviv',
                location: { lat: 31.9200, lng: 38.3500 },
                logo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80',
                banner: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80'
            }
        ]);
        console.log('Restaurants created!');

        const products = await Products.insertMany([
            // --- Burger King menu ---
            {   name: 'Classic Burger',
                description: 'Beef patty with lettuce, tomato, and pickles.',
                price: 49.99,
                restaurantId: restaurants[0]._id,
                calories: 500,
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80'
            },
            {   name: 'Double Cheese Burger',
                description: 'Two patties with extra cheddar cheese.',
                price: 69.99, 
                restaurantId: restaurants[0]._id,
                calories: 750,
                image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80',
                limited: true
            },
            {   name: 'Crispy Fries', 
                description: 'Golden potato fries with ketchup.', 
                price: 14.99,
                restaurantId: restaurants[0]._id,
                calories: 500,
                image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80'
            },
            // --- Sushi Mushi menu ---
            {   name: 'Spicy Tuna Roll', 
                description: '8 pieces of fresh tuna with spicy mayo.', 
                price: 67.00, 
                restaurantId: restaurants[1]._id,
                calories: 670,
                image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500&q=80'
            },
            {   name: 'Salmon Nigiri', 
                description: '2 pieces of fresh salmon over pressed rice.', 
                price: 44.99, 
                restaurantId: restaurants[1]._id,
                calories: 380,
                image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&q=80'
            },
            // --- Pizza Hut menu ---
            {   name: 'Margherita Pizza', 
                description: 'Tomato sauce, fresh mozzarella, and basil.', 
                price: 39.99, 
                restaurantId: restaurants[2]._id,
                calories: 690,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80'
            },
            {   name: 'Pepperoni Pizza', 
                description: 'Classic pizza topped with crispy pepperoni.', 
                price: 47.99, 
                restaurantId: restaurants[2]._id,
                calories: 760,
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80'
            },
            // --- Mexicani menu ---
            {   name: 'Clasicc Tortilla', 
                description: '1X meat + 1X bread', 
                price: 37.99, 
                restaurantId: restaurants[3]._id,
                calories: 360,
                image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=500&q=80'
            },
            {   name: 'Double Tortilla', 
                description: '2X meat + 2X bread', 
                price: 59.99, 
                restaurantId: restaurants[3]._id,
                calories: 720,
                image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=500&q=80'
            }
        ]);
        console.log('Products (Menu items) created!');
        console.log('✅ Database seeded successfully!');
        process.exit();

    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();