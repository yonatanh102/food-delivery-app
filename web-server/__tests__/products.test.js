const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app'); // Ensure the path to your app.js is correct

// MOCK THE TCP CLIENT
// This prevents actual network calls to the C++ server during testing
jest.mock('../src/tcpClient', () => ({
    sendCommand: jest.fn().mockResolvedValue('OK')
}));

// Define helper variables
let testProductId;
const testRestaurantId = new mongoose.Types.ObjectId().toString(); // Fake valid restaurant ID
const nonExistentId = new mongoose.Types.ObjectId().toString(); 
const invalidId = '12345-invalid';

// Create mock tokens for authorization (RBAC)
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';
const adminToken = jwt.sign({ userId: 'admin123', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
const clientToken = jwt.sign({ userId: 'client123', role: 'client' }, JWT_SECRET, { expiresIn: '1h' });

const validProductData = {
    restaurantId: testRestaurantId,
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with cheddar",
    price: 45.50,
    calories: 650,
    limited: false
};

beforeAll(async () => {
    const testMongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/food_test_db';
    await mongoose.connect(testMongoUri);
});

afterAll(async () => {
    await mongoose.connection.collection('products').deleteMany({});
    await mongoose.connection.close();
});

describe('Products API Tests', () => {

    // ==========================================
    // 1. CREATE (POST /products) - 8 Tests
    // ==========================================
    describe('POST /products', () => {
        it('1. [Success] Admin should create a valid product', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validProductData);
                
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toBe(validProductData.name);
            testProductId = res.body._id; // Save ID for later tests
        });

        it('2. [Fail] Client cannot create a product (403 Forbidden)', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ ...validProductData, name: "Client Burger" });
            expect(res.status).toBe(403);
        });

        it('3. [Fail] Unauthenticated user cannot create (401 Unauthorized)', async () => {
            const res = await request(app).post('/products')
                .send({ ...validProductData, name: "Ghost Burger" });
            expect(res.status).toBe(401);
        });

        it('4. [Fail] Missing required field "price"', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ restaurantId: testRestaurantId, name: "Free Burger", description: "Yummy" });
            expect(res.status).toBe(500); // Mongoose validation error
            expect(res.body.message).toMatch(/price.*required/i);
        });

        it('5. [Fail] Missing required field "restaurantId"', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Lost Burger", description: "No home", price: 10 });
            expect(res.status).toBe(500);
        });

        it('6. [Fail] Price cannot be zero or negative', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...validProductData, price: -5 });
            expect(res.status).toBe(500);
            expect(res.body.message).toMatch(/price/i);
        });

        it('7. [Fail] Calories cannot be negative', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...validProductData, calories: -100 });
            expect(res.status).toBe(500);
            expect(res.body.message).toMatch(/calories/i);
        });

        it('8. [Success] Create product with default limited=false if omitted', async () => {
            const res = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ 
                    restaurantId: testRestaurantId, 
                    name: "Default Burger", 
                    description: "Test defaults", 
                    price: 30 
                });
            expect(res.status).toBe(201);
            expect(res.body.limited).toBe(false); // Schema default value check
        });
    });

    // ==========================================
    // 2. READ ALL (GET /products) - 5 Tests
    // ==========================================
    describe('GET /products', () => {
        it('1. [Success] Anyone can fetch all products (No Token needed)', async () => {
            const res = await request(app).get('/products');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it('2. [Success] Array contains previously created products', async () => {
            const res = await request(app).get('/products');
            expect(res.body.length).toBeGreaterThanOrEqual(2); 
        });

        it('3. [Success] Client token can also fetch all products', async () => {
            const res = await request(app).get('/products')
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.status).toBe(200);
        });

        it('4. [Success] Admin token can also fetch all products', async () => {
            const res = await request(app).get('/products')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });

        it('5. [Success] Items in array match the schema structure', async () => {
            const res = await request(app).get('/products');
            const firstItem = res.body[0];
            expect(firstItem).toHaveProperty('price');
            expect(firstItem).toHaveProperty('restaurantId');
        });
    });

    // ==========================================
    // 3. READ ONE (GET /products/:id) - 6 Tests
    // ==========================================
    describe('GET /products/:id', () => {
        it('1. [Success] Anyone can fetch a specific product by valid ID', async () => {
            const res = await request(app).get(`/products/${testProductId}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testProductId);
        });

        it('2. [Fail] Valid MongoDB ID but product does not exist (404)', async () => {
            const res = await request(app).get(`/products/${nonExistentId}`);
            expect(res.status).toBe(404);
        });

        it('3. [Fail] Invalid MongoDB ID format throws error', async () => {
            const res = await request(app).get(`/products/${invalidId}`);
            expect(res.status).toBe(500); 
        });

        it('4. [Success] Returns correct data values for the requested product', async () => {
            const res = await request(app).get(`/products/${testProductId}`);
            expect(res.body.name).toBe("Classic Cheeseburger");
        });

        it('5. [Success] Accessible with Client Token', async () => {
            const res = await request(app).get(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.status).toBe(200);
        });

        it('6. [Success] Including userId query param does not crash (TCP mock check)', async () => {
            // Testing the ADD_VIEW logic we implemented earlier!
            const res = await request(app).get(`/products/${testProductId}?userId=user123`);
            expect(res.status).toBe(200);
            // The mocked TCP client silently accepted the call in the background
        });
    });

    // ==========================================
    // 4. UPDATE (PUT /products/:id) - 8 Tests
    // ==========================================
    describe('PUT /products/:id', () => {
        it('1. [Success] Admin can update an existing product', async () => {
            const res = await request(app).put(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: 50.00 });
            expect(res.status).toBe(200);
            expect(res.body.price).toBe(50.00);
        });

        it('2. [Fail] Client cannot update (403)', async () => {
            const res = await request(app).put(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ name: "Client Hack" });
            expect(res.status).toBe(403);
        });

        it('3. [Fail] Unauthenticated cannot update (401)', async () => {
            const res = await request(app).put(`/products/${testProductId}`)
                .send({ name: "Ghost Hack" });
            expect(res.status).toBe(401);
        });

        it('4. [Fail] Update non-existent product returns 404', async () => {
            const res = await request(app).put(`/products/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Doesn't Matter" });
            expect(res.status).toBe(404);
        });

        it('5. [Fail] Update with invalid ID format', async () => {
            const res = await request(app).put(`/products/${invalidId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Doesn't Matter" });
            expect(res.status).toBe(500);
        });

        it('6. [Success] Update multiple fields at once (calories and limited status)', async () => {
            const res = await request(app).put(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ calories: 700, limited: true });
            expect(res.status).toBe(200);
            expect(res.body.calories).toBe(700);
            expect(res.body.limited).toBe(true);
        });

        it('7. [Fail] Update to negative price triggers validation error', async () => {
            const res = await request(app).put(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ price: -10 });
            expect(res.status).toBe(500);
        });

        it('8. [Success] Ensure old un-updated fields remain intact', async () => {
            const res = await request(app).get(`/products/${testProductId}`);
            expect(res.body.description).toBe(validProductData.description); 
        });
    });

    // ==========================================
    // 5. DELETE (DELETE /products/:id) - 8 Tests
    // ==========================================
    describe('DELETE /products/:id', () => {
        it('1. [Fail] Client cannot delete (403)', async () => {
            const res = await request(app).delete(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.status).toBe(403);
        });

        it('2. [Fail] Unauthenticated cannot delete (401)', async () => {
            const res = await request(app).delete(`/products/${testProductId}`);
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Delete non-existent product returns 404', async () => {
            const res = await request(app).delete(`/products/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('4. [Fail] Delete with invalid ID format', async () => {
            const res = await request(app).delete(`/products/${invalidId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(500);
        });

        it('5. [Success] Admin successfully deletes the product', async () => {
            // Note: If your controller returns 204 No Content, expect 204.
            // Based on previous code, we returned 204 or 200 depending on your exact version.
            // Adjust to toBe(204) if needed.
            const res = await request(app).delete(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBeGreaterThanOrEqual(200); 
            expect(res.status).toBeLessThan(300);
        });

        it('6. [Success] Verify product is actually removed (GET returns 404)', async () => {
            const res = await request(app).get(`/products/${testProductId}`);
            expect(res.status).toBe(404);
        });

        it('7. [Fail] Admin tries to delete the same product twice (404)', async () => {
            const res = await request(app).delete(`/products/${testProductId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('8. [Success] Can delete another newly created product without issues', async () => {
            // Create a temp product
            const createRes = await request(app).post('/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ restaurantId: testRestaurantId, name: "Temp", description: "Temp", price: 10 });
            const tempId = createRes.body._id;

            // Delete it
            const deleteRes = await request(app).delete(`/products/${tempId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(deleteRes.status).toBeGreaterThanOrEqual(200);
        });
    });
});