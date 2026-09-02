const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app'); 

// MOCK THE TCP CLIENT (Fire & Forget mock for ADD_PURCHASE)
jest.mock('../src/tcpClient', () => ({
    sendCommand: jest.fn().mockResolvedValue('OK')
}));

// Define helper variables for IDs
let testOrderId;
let validRestaurantId1;
let validRestaurantId2;
let validProductId1; // Belongs to Restaurant 1
let validProductId2; // Belongs to Restaurant 2

const nonExistentId = new mongoose.Types.ObjectId().toString();
const invalidId = 'invalid-mongo-id';

// Create mock tokens for authorization & ownership tests
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';
const adminToken = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

const clientAToken = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), role: 'client' }, JWT_SECRET, { expiresIn: '1h' });
const clientBToken = jwt.sign({ userId: new mongoose.Types.ObjectId().toString(), role: 'client' }, JWT_SECRET, { expiresIn: '1h' });

// Decode Client A token to get the exact ID for spoofing tests
const clientAId = jwt.decode(clientAToken).userId;

beforeAll(async () => {
    const testMongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/food_test_db';
    await mongoose.connect(testMongoUri);

    // SETUP: Create prerequisites (Restaurants and Products) using the API as Admin
    const resRest1 = await request(app).post('/restaurants').set('Authorization', `Bearer ${adminToken}`).send({ name: "Burger Place", location: { lat: 1, lng: 1 }, address: "123 Main St" });
    validRestaurantId1 = resRest1.body._id;

    const resRest2 = await request(app).post('/restaurants').set('Authorization', `Bearer ${adminToken}`).send({ name: "Pizza Place", location: { lat: 2, lng: 2 }, address: "456 Side St" });
    validRestaurantId2 = resRest2.body._id;

    const resProd1 = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send({ restaurantId: validRestaurantId1, name: "Burger", description: "Yum", price: 10 });
    validProductId1 = resProd1.body._id;

    const resProd2 = await request(app).post('/products').set('Authorization', `Bearer ${adminToken}`).send({ restaurantId: validRestaurantId2, name: "Pizza", description: "Yum", price: 20 });
    validProductId2 = resProd2.body._id;
});

afterAll(async () => {
    // Clean up all collections used in this test
    await mongoose.connection.collection('orders').deleteMany({});
    await mongoose.connection.collection('restaurants').deleteMany({});
    await mongoose.connection.collection('products').deleteMany({});
    await mongoose.connection.close();
});

describe('Orders API Tests', () => {

    // ==========================================
    // 1. CREATE (POST /orders) - 9 Tests
    // ==========================================
    describe('POST /orders', () => {
        it('1. [Success] Client A creates a valid order', async () => {
            const validOrder = {
                restaurantId: validRestaurantId1,
                products: [
                    { productId: validProductId1, productName: "Burger", quantity: 2 }
                ],
                description: "No onions please"
            };

            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send(validOrder);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.userId).toBe(clientAId); // Ensure the controller injected the correct user ID
            testOrderId = res.body._id; 
        });

        it('2. [Fail] Unauthenticated user cannot create order', async () => {
            const res = await request(app).post('/orders')
                .send({ restaurantId: validRestaurantId1, products: [] });
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Missing required field (restaurantId)', async () => {
            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ products: [{ productId: validProductId1, productName: "Burger" }] });
            expect(res.status).toBe(500); // Or 400 depending on validation wrapper
        });

        it('4. [Fail] Target restaurant does not exist in DB', async () => {
            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ 
                    restaurantId: nonExistentId, 
                    products: [{ productId: validProductId1, productName: "Burger" }] 
                });
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/Restaurant not found/i);
        });

        it('5. [Fail] Product belongs to a different restaurant (Referential Integrity Check)', async () => {
            // Trying to order Product 2 (Pizza) from Restaurant 1 (Burger Place)
            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ 
                    restaurantId: validRestaurantId1, 
                    products: [{ productId: validProductId2, productName: "Pizza" }] 
                });
            expect(res.status).toBe(400); // Bad Request
            expect(res.body.error).toMatch(/does not belong/i);
        });

        it('6. [Fail] Product does not exist in DB at all', async () => {
            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ 
                    restaurantId: validRestaurantId1, 
                    products: [{ productId: nonExistentId, productName: "Ghost" }] 
                });
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/Product.*not found/i);
        });

        it('7. [Fail] Quantity cannot be zero or negative (Schema validation)', async () => {
            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ 
                    restaurantId: validRestaurantId1, 
                    products: [{ productId: validProductId1, productName: "Burger", quantity: -1 }] 
                });
            expect(res.status).toBe(500);
        });

        it('8. [Success/Security] ID Spoofing is blocked (forces token ID)', async () => {
            // Hacker tries to pass someone else's ID in the body
            const hackerOrder = {
                userId: "hacker_fake_id_123", 
                restaurantId: validRestaurantId1,
                products: [{ productId: validProductId1, productName: "Burger", quantity: 1 }]
            };

            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send(hackerOrder);
                
            expect(res.status).toBe(201);
            // The saved order MUST have Client A's ID, ignoring the body
            expect(res.body.userId).toBe(clientAId); 
            expect(res.body.userId).not.toBe("hacker_fake_id_123"); 
        });

        it('9. [Success] Order succeeds even if TCP server is down (Fire & Forget)', async () => {
            const tcpClient = require('../src/tcpClient');
            tcpClient.sendCommand.mockRejectedValueOnce(new Error('TCP Server Offline'));

            const validOrder = {
                restaurantId: validRestaurantId1,
                products: [{ productId: validProductId1, productName: "Burger", quantity: 1 }]
            };

            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send(validOrder);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
        });
    });

    // ==========================================
    // 2. READ ALL (GET /orders) - 5 Tests
    // ==========================================
    describe('GET /orders', () => {
        it('1. [Success] Authenticated user can fetch orders', async () => {
            const res = await request(app).get('/orders')
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it('2. [Fail] Unauthenticated user cannot fetch orders (401)', async () => {
            const res = await request(app).get('/orders');
            expect(res.status).toBe(401);
        });

        it('3. [Success] Order array contains the previously created order', async () => {
            const res = await request(app).get('/orders')
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
        });

        it('4. [Success] Order object structure contains nested products array', async () => {
            const res = await request(app).get('/orders')
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.body[0]).toHaveProperty('products');
            expect(Array.isArray(res.body[0].products)).toBe(true);
        });

        it('5. [Success] Default status is applied correctly', async () => {
            const res = await request(app).get('/orders')
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.body[0]).toHaveProperty('status', 'pending');
        });
    });

    // ==========================================
    // 3. READ ONE (GET /orders/:id) - 5 Tests
    // ==========================================
    describe('GET /orders/:id', () => {
        it('1. [Success] Authenticated user can fetch a specific order', async () => {
            const res = await request(app).get(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testOrderId);
        });

        it('2. [Fail] Non-existent order ID returns 404', async () => {
            const res = await request(app).get(`/orders/${nonExistentId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(404);
        });

        it('3. [Fail] Invalid ID format returns error', async () => {
            const res = await request(app).get(`/orders/${invalidId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(500);
        });

        it('4. [Fail] Unauthenticated request is blocked', async () => {
            const res = await request(app).get(`/orders/${testOrderId}`);
            expect(res.status).toBe(401);
        });

        it('5. [Success] Admin can also fetch the specific order', async () => {
            const res = await request(app).get(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });
    });

    // ==========================================
    // 4. UPDATE (PUT /orders/:id) - 6 Tests
    // ==========================================
    describe('PUT /orders/:id', () => {
        it('1. [Success] Owner (Client A) can update their order description', async () => {
            const res = await request(app).put(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ description: "Extra ketchup please" });
            expect(res.status).toBe(200);
            expect(res.body.description).toBe("Extra ketchup please");
        });

        it('2. [Fail] Non-owner (Client B) cannot update Client A\'s order (403)', async () => {
            const res = await request(app).put(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientBToken}`)
                .send({ description: "I hacked your order" });
            expect(res.status).toBe(403);
            expect(res.body.error).toMatch(/Access denied/i);
        });

        it('3. [Fail] Unauthenticated user cannot update', async () => {
            const res = await request(app).put(`/orders/${testOrderId}`)
                .send({ status: "Completed" });
            expect(res.status).toBe(401);
        });

        it('4. [Fail] Update non-existent order returns 404', async () => {
            const res = await request(app).put(`/orders/${nonExistentId}`)
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ description: "Test" });
            expect(res.status).toBe(404);
        });

        it('5. [Fail] Update with invalid ID format', async () => {
            const res = await request(app).put(`/orders/${invalidId}`)
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ description: "Test" });
            expect(res.status).toBe(500);
        });

        it('6. [Success/Security] Owner cannot spoof user ownership via update', async () => {
            // Even if sent in body, logic should ignore or controller should block it
            const res = await request(app).put(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ userId: "stolen_user_id" });
            // Since we use findByIdAndUpdate, make sure your controller overrides body.userId
            // Assuming the controller overwrites or we just fetch to verify it didn't change ownership
            const check = await request(app).get(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(check.body.userId).toBe(clientAId); 
        });
    });

    // ==========================================
    // 5. DELETE (DELETE /orders/:id) - 8 Tests
    // ==========================================
    describe('DELETE /orders/:id', () => {
        it('1. [Fail] Non-owner (Client B) cannot delete Client A\'s order (403)', async () => {
            const res = await request(app).delete(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientBToken}`);
            expect(res.status).toBe(403);
            expect(res.body.error).toMatch(/Access denied/i);
        });

        it('2. [Fail] Unauthenticated user cannot delete', async () => {
            const res = await request(app).delete(`/orders/${testOrderId}`);
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Delete non-existent order returns 404', async () => {
            const res = await request(app).delete(`/orders/${nonExistentId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(404);
        });

        it('4. [Fail] Delete with invalid ID format', async () => {
            const res = await request(app).delete(`/orders/${invalidId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(500);
        });

        it('5. [Success] Owner (Client A) successfully deletes their own order', async () => {
            const res = await request(app).delete(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testOrderId);
        });

        it('6. [Success] Verify order is actually removed (GET returns 404)', async () => {
            const res = await request(app).get(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(404);
        });

        it('7. [Fail] Owner tries to delete the same order twice (404)', async () => {
            const res = await request(app).delete(`/orders/${testOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(res.status).toBe(404);
        });

        it('8. [Success] Owner can delete a brand new order seamlessly', async () => {
            // Create a temp order
            const tempOrderRes = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ 
                    restaurantId: validRestaurantId1, 
                    products: [{ productId: validProductId1, productName: "Burger", quantity: 1 }] 
                });
            const tempOrderId = tempOrderRes.body._id;

            // Delete it immediately
            const deleteRes = await request(app).delete(`/orders/${tempOrderId}`)
                .set('Authorization', `Bearer ${clientAToken}`);
            expect(deleteRes.status).toBe(200);
        });
    });

    // ==========================================
    // 6. UPDATE STATUS (PUT /orders/:id/status) - 2 Tests
    // ==========================================
    describe('PUT /orders/:id/status', () => {
        let statusOrderId;
        
        beforeAll(async () => {
            const res = await request(app).post('/orders')
                .set('Authorization', `Bearer ${clientAToken}`)
                .send({ 
                    restaurantId: validRestaurantId1, 
                    products: [{ productId: validProductId1, productName: "Burger", quantity: 1 }] 
                });
            statusOrderId = res.body._id;
        });

        it('1. [Success] Admin can update order status', async () => {
            const res = await request(app).put(`/orders/${statusOrderId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Delivered' });
            
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('Delivered');
        });

        it('2. [Fail] Return 404 for non-existent order status update', async () => {
            const res = await request(app).put(`/orders/${nonExistentId}/status`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'Delivered' });
            
            expect(res.status).toBe(404);
        });
    });
});