const mongoose = require('mongoose');

const Restaurants = require('./models/restaurants');
const Products = require('./models/products');
const Users = require('./models/users');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        const count = await Restaurants.countDocuments();
        if (count > 0) {
            console.log('Database already has data. Skipping seed...');
            return;
        }

        console.log('Database is empty. Seeding...');

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
                address: 'Dizengoff Center, Tel Aviv',
                location: { lat: 32.0741, lng: 34.7748 },
                logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=1200&q=80' 
            },
            {
                name: 'Sushi Mushi',
                description: 'Fresh sushi, sashimi, and authentic Japanese cuisine.',
                address: 'Rothschild Blvd 45, Tel Aviv',
                location: { lat: 32.0620, lng: 34.7740 },
                logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=1200&q=80' 
            },
            {
                name: 'Pizza Hut',
                description: 'Wood-fired pizzas made with fresh, local ingredients.',
                address: 'Jaffa Port, Tel Aviv-Yafo',
                location: { lat: 32.0528, lng: 34.7520 },
                logo: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80' 
            },
            {
                name: 'Mexicani',
                description: 'The best Mexican food in the south!',
                address: 'Ben Gurion University, Be\'er Sheva',
                location: { lat: 31.2622, lng: 34.8015 },
                logo: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80' 
            },
            {
                name: 'McDonald\'s',
                description: 'I\'m lovin\' it. Classic burgers and world-famous fries.',
                address: 'Zim Center, Arad',
                location: { lat: 31.2588, lng: 35.2128 },
                logo: 'https://images.unsplash.com/photo-1649775391951-e3fdf0e7e7ec?q=80&w=881&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                banner: 'https://images.unsplash.com/photo-1552895638-f7fe08d2f7d5?w=1200&q=80' 
            },
            {
                name: 'KFC',
                description: 'Finger Lickin\' Good Kentucky Fried Chicken.',
                address: 'Jaffa Street, Jerusalem',
                location: { lat: 31.7810, lng: 35.2137 },
                logo: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=1200&q=80' 
            },
            {
                name: 'Golda Ice Cream',
                description: 'Premium boutique ice cream with crazy flavors and loaded waffles.',
                address: 'Sarona Market, Tel Aviv',
                location: { lat: 32.0715, lng: 34.7870 },
                logo: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1200&q=80' 
            },
            {
                name: 'Shawarma Bino',
                description: 'Authentic Israeli street food, fresh pita and premium meats.',
                address: 'Clock Tower, Jaffa',
                location: { lat: 32.0555, lng: 34.7554 },
                logo: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&q=80', // תוקן: דוכן שווארמה/בשר
                banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80' 
            },
            {
                name: 'Thai Wok',
                description: 'Spicy, sweet, and authentic Thai street noodles.',
                address: 'Carmel Center, Haifa',
                location: { lat: 32.8051, lng: 34.9854 },
                logo: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=1200&q=80' 
            },
            {
                name: 'Hummus Abu Hassan',
                description: 'The legendary hummus place. Hot, fresh, and perfectly spiced.',
                address: 'HaDolfin St 1, Jaffa',
                location: { lat: 32.0505, lng: 34.7485 },
                logo: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=500&q=80', 
                banner: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1200&q=80' 
            }
        ]);
        console.log('Restaurants created!');

        const products = await Products.insertMany([
            // --- Burger King (0) ---
            { name: 'Whopper Classic', description: 'Beef patty with lettuce, tomato, and pickles.', price: 49.99, restaurantId: restaurants[0]._id, calories: 650, 
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' }, 
            { name: 'Double Cheese Burger', description: 'Two patties with extra cheddar cheese.', price: 69.99, restaurantId: restaurants[0]._id, calories: 850, 
                image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80', limited: true }, 
            { name: 'Crispy Fries', description: 'Golden potato fries with ketchup.', price: 14.99, restaurantId: restaurants[0]._id, calories: 380, 
                image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80' }, 
            
            // --- Sushi Mushi (1) ---
            { name: 'Spicy Tuna Roll', description: '8 pieces of fresh tuna with spicy mayo.', price: 67.00, restaurantId: restaurants[1]._id, calories: 420, 
                image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80' },
            { name: 'Salmon Nigiri', description: '2 pieces of fresh salmon over pressed rice.', price: 44.99, restaurantId: restaurants[1]._id, calories: 210, 
                image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=500&q=80' }, 
            { name: 'Dragon Roll', description: 'Shrimp tempura topped with avocado and eel sauce.', price: 72.00, restaurantId: restaurants[1]._id, calories: 550, 
                image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80' }, 

            // --- Pizza Hut (2) ---
            { name: 'Margherita Pizza', description: 'Tomato sauce, fresh mozzarella, and basil.', price: 39.99, restaurantId: restaurants[2]._id, calories: 1200, 
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80' }, 
            { name: 'Pepperoni Pizza', description: 'Classic pizza topped with crispy pepperoni.', price: 47.99, restaurantId: restaurants[2]._id, calories: 1450, 
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80' }, 
            { name: 'Garlic Bread', description: 'Warm breadsticks brushed with garlic butter.', price: 19.99, restaurantId: restaurants[2]._id, calories: 450, 
                image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8R2FybGljJTIwQnJlYWR8ZW58MHx8MHx8fDA%3D' },

            // --- Mexicani (3) ---
            { name: 'Classic Burrito', description: 'Rice, beans, grilled chicken, and fresh salsa.', price: 42.99, restaurantId: restaurants[3]._id, calories: 750, 
                image: 'https://plus.unsplash.com/premium_photo-1733259882547-31f52c9a3810?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fENsYXNzaWMlMjBCdXJyaXRvfGVufDB8fDB8fHww' }, 
            { name: 'Beef Tacos', description: '3 crispy shells filled with seasoned ground beef.', price: 38.99, restaurantId: restaurants[3]._id, calories: 540, 
                image: 'https://plus.unsplash.com/premium_photo-1661730314652-911662c0d86e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fEJlZWYlMjBUYWNvc3xlbnwwfHwwfHx8MA%3D%3D' }, 
            { name: 'Loaded Nachos', description: 'Tortilla chips covered in melted cheese and jalapeños.', price: 34.99, restaurantId: restaurants[3]._id, calories: 890, 
                image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80' }, 

            // --- McDonald's (4) ---
            { name: 'Big Mac', description: 'Two 100% beef patties with Big Mac sauce.', price: 45.00, restaurantId: restaurants[4]._id, calories: 550, 
                image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80' }, 
            { name: 'McNuggets (9 pc)', description: 'Crispy chicken nuggets with sweet & sour dip.', price: 32.00, restaurantId: restaurants[4]._id, calories: 420, 
                image: 'https://images.unsplash.com/photo-1562967914-01efa7e87832?w=500&q=80' }, 
            { name: 'Oreo McFlurry', description: 'Vanilla soft serve mixed with crushed Oreo cookies.', price: 18.00, restaurantId: restaurants[4]._id, calories: 510, 
                image: 'https://images.unsplash.com/photo-1627053947185-1d02dc9435ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8T3JlbyUyME1jRmx1cnJ5fGVufDB8fDB8fHww' },

            // --- KFC (5) ---
            { name: 'Zinger Burger', description: 'Spicy fried chicken breast in a sesame bun.', price: 41.99, restaurantId: restaurants[5]._id, calories: 600, 
                image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80' },
            { name: 'Hot Wings Bucket', description: '12 pieces of crispy, spicy chicken wings.', price: 65.00, restaurantId: restaurants[5]._id, calories: 1200, 
                image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80' }, 
            
            // --- Golda Ice Cream (6) ---
            { name: 'Pistachio Ice Cream', description: 'Half kilo of premium pistachio ice cream.', price: 55.00, restaurantId: restaurants[6]._id, calories: 1100, 
                image: 'https://media.istockphoto.com/id/2210712180/photo/pistachio-ice-cream.webp?a=1&b=1&s=612x612&w=0&k=20&c=VCD48kWe0gDcz3E_YkkujStX0vZXTIlPYz48Yy320Q4=' },
            { name: 'Belgian Waffle', description: 'Hot waffle topped with chocolate hazelnut cream.', price: 48.00, restaurantId: restaurants[6]._id, calories: 850, 
                image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&q=80' }, 

            // --- Shawarma Bino (7) ---
            { name: 'Turkey Shawarma in Pita', description: 'Fresh pita packed with juicy shawarma and tahini.', price: 45.00, restaurantId: restaurants[7]._id, calories: 750, 
                image: 'https://images.unsplash.com/photo-1699728088614-7d1d4277414b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
            { name: 'Falafel Plate', description: '10 crispy falafel balls with hummus and salad.', price: 38.00, restaurantId: restaurants[7]._id, calories: 600,
                 image: 'https://plus.unsplash.com/premium_photo-1663853052091-ba98b2732ba8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },

            // --- Thai Wok (8) ---
            { name: 'Pad Thai', description: 'Stir-fried rice noodles with egg, peanuts, and chicken.', price: 58.00, restaurantId: restaurants[8]._id, calories: 680, 
                image: 'https://images.unsplash.com/photo-1637806931098-af30b519be53?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8UGFkJTIwVGhhaXxlbnwwfHwwfHx8MA%3D%3D' }, 
            { name: 'Red Curry', description: 'Spicy coconut curry with bamboo shoots and beef.', price: 62.00, restaurantId: restaurants[8]._id, calories: 720, 
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UmVkJTIwQ3Vycnl8ZW58MHx8MHx8fDA%3D' },

            // --- Hummus Abu Hassan (9) ---
            { name: 'Hummus Masabacha', description: 'Warm chickpeas served over fresh hummus with olive oil.', price: 29.00, restaurantId: restaurants[9]._id, calories: 450, 
                image: 'https://images.unsplash.com/photo-1598683387054-fb5dec53ecea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fEh1bW11cyUyME1hc2FiYWNoYXxlbnwwfHwwfHx8MA%3D%3D' },
            { name: 'Hummus Foul', description: 'Hummus topped with slow-cooked fava beans.', price: 31.00, restaurantId: restaurants[9]._id, calories: 480, 
                image: 'https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8SHVtbXVzJTIwRm91bHxlbnwwfHwwfHx8MA%3D%3D' }
        ]);
        console.log(`Created ${products.length} Products!`);
        console.log('✅ Database seeded successfully!');

    } catch (err) {
        console.error('❌ Error seeding database:', err);
    }
};

module.exports = seedDatabase;