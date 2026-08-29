const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app'); // Ensure the path to your app.js is correct

// Define helper variables for tests
let testRestaurantId;
const nonExistentId = new mongoose.Types.ObjectId().toString(); // Valid MongoDB ID but does not exist in the DB
const invalidId = '12345-invalid-id'; // Invalid MongoDB ID format

// Create mock tokens for authorization tests
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';
const adminToken = jwt.sign({ userId: 'admin123', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
const clientToken = jwt.sign({ userId: 'client123', role: 'client' }, JWT_SECRET, { expiresIn: '1h' });

beforeAll(async () => {
    // Connect to a dedicated test database to avoid affecting real data
    const testMongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/food_test_db';
    await mongoose.connect(testMongoUri);
});

afterAll(async () => {
    // Delete all restaurants created during tests to start clean next time
    await mongoose.connection.collection('restaurants').deleteMany({});
    await mongoose.connection.close();
});

describe('Restaurants API Tests', () => {

    // ==========================================
    // 1. CREATE (POST /restaurants) - 8 Tests
    // ==========================================
    describe('POST /restaurants', () => {
        it('1. [Success] Admin should create a valid restaurant', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: "Test Burger",
                    location: { lat: 32.0853, lng: 34.7818 },
                    description: "Best burgers",
                    type: "Fast Food"
                });
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.name).toBe("Test Burger");
            testRestaurantId = res.body._id; // Save for later tests
        });

        it('2. [Fail] Client cannot create a restaurant (403 Forbidden)', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ name: "Hacker Pizza", location: { lat: 1, lng: 1 } });
            expect(res.status).toBe(403);
        });

        it('3. [Fail] Unauthenticated user cannot create (401 Unauthorized)', async () => {
            const res = await request(app).post('/restaurants')
                .send({ name: "Ghost Pizza", location: { lat: 1, lng: 1 } });
            expect(res.status).toBe(401);
        });

        it('4. [Fail] Missing required field "name"', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ location: { lat: 1, lng: 1 } });
            expect(res.status).toBe(500); // Assuming the controller wraps mongoose errors in 500
            expect(res.body.message).toMatch(/name.*required/i);
        });

        it('5. [Fail] Missing required field "location"', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "No Location" });
            expect(res.status).toBe(500);
        });

        it('6. [Fail] Missing "lat" in location object', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Bad Location", location: { lng: 34.1 } });
            expect(res.status).toBe(500);
        });

        it('7. [Fail] Invalid data type for location (string instead of number)', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "String Loc", location: { lat: "not-a-number", lng: 34.1 } });
            expect(res.status).toBe(500);
        });

        it('8. [Success] Create restaurant with minimum required fields only', async () => {
            const res = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Min Req", location: { lat: 10, lng: 20 } });
            expect(res.status).toBe(201);
            expect(res.body).not.toHaveProperty('description'); // Not sent, so it shouldn't exist
        });
    });

    // ==========================================
    // 2. READ ALL (GET /restaurants) - 5 Tests
    // ==========================================
    describe('GET /restaurants', () => {
        it('1. [Success] Anyone can fetch all restaurants (No Token needed)', async () => {
            const res = await request(app).get('/restaurants');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it('2. [Success] Array contains previously created restaurants', async () => {
            const res = await request(app).get('/restaurants');
            expect(res.body.length).toBeGreaterThanOrEqual(2); // We created 2 valid restaurants above
        });

        it('3. [Success] Client token can also fetch all restaurants', async () => {
            const res = await request(app).get('/restaurants')
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.status).toBe(200);
        });

        it('4. [Success] Admin token can also fetch all restaurants', async () => {
            const res = await request(app).get('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
        });

        it('5. [Success] Items in array match the schema structure', async () => {
            const res = await request(app).get('/restaurants');
            const firstItem = res.body[0];
            expect(firstItem).toHaveProperty('name');
            expect(firstItem).toHaveProperty('location');
        });
    });

    // ==========================================
    // 3. READ ONE (GET /restaurants/:id) - 5 Tests
    // ==========================================
    describe('GET /restaurants/:id', () => {
        it('1. [Success] Anyone can fetch a specific restaurant by valid ID', async () => {
            const res = await request(app).get(`/restaurants/${testRestaurantId}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testRestaurantId);
        });

        it('2. [Fail] Valid MongoDB ID but restaurant does not exist (404)', async () => {
            const res = await request(app).get(`/restaurants/${nonExistentId}`);
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/not found/i);
        });

        it('3. [Fail] Invalid MongoDB ID format throws server error', async () => {
            const res = await request(app).get(`/restaurants/${invalidId}`);
            expect(res.status).toBe(500); // Or 400 if handled specifically in the controller
        });

        it('4. [Success] Returns correct data values for the requested restaurant', async () => {
            const res = await request(app).get(`/restaurants/${testRestaurantId}`);
            expect(res.body.name).toBe("Test Burger");
        });

        it('5. [Success] Accessible with Client Token', async () => {
            const res = await request(app).get(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            expect(res.status).toBe(200);
        });
    });

    // ==========================================
    // 4. UPDATE (PUT /restaurants/:id) - 8 Tests
    // ==========================================
    describe('PUT /restaurants/:id', () => {
        it('1. [Success] Admin can update an existing restaurant', async () => {
            const res = await request(app).put(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Updated Burger" });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe("Updated Burger");
        });

        it('2. [Fail] Client cannot update (403)', async () => {
            const res = await request(app).put(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ name: "Client Hack" });
            expect(res.status).toBe(403);
        });

        it('3. [Fail] Unauthenticated cannot update (401)', async () => {
            const res = await request(app).put(`/restaurants/${testRestaurantId}`)
                .send({ name: "Ghost Hack" });
            expect(res.status).toBe(401);
        });

        it('4. [Fail] Update non-existent restaurant returns 404', async () => {
            const res = await request(app).put(`/restaurants/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Doesn't Matter" });
            expect(res.status).toBe(404);
        });

        it('5. [Fail] Update with invalid ID format', async () => {
            const res = await request(app).put(`/restaurants/${invalidId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Doesn't Matter" });
            expect(res.status).toBe(500);
        });

        it('6. [Success] Update multiple fields at once', async () => {
            const res = await request(app).put(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ description: "New Desc", type: "Vegan" });
            expect(res.status).toBe(200);
            expect(res.body.description).toBe("New Desc");
            expect(res.body.type).toBe("Vegan");
        });

        it('7. [Fail] Try to nullify a required field (validation error)', async () => {
            const res = await request(app).put(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: null });
            expect(res.status).toBe(500);
        });

        it('8. [Success] Ensure old un-updated fields remain intact', async () => {
            const res = await request(app).get(`/restaurants/${testRestaurantId}`);
            // The location was not updated in previous tests, ensure it is still there
            expect(res.body.location.lat).toBe(32.0853); 
        });
    });

    // ==========================================
    // 5. DELETE (DELETE /restaurants/:id) - 8 Tests
    // ==========================================
    describe('DELETE /restaurants/:id', () => {
        it('1. [Fail] Client cannot delete (403)', async () => {
            const res = await request(app).delete(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            
            expect(res.status).toBe(403);
        });

        it('2. [Fail] Unauthenticated cannot delete (401)', async () => {
            const res = await request(app).delete(`/restaurants/${testRestaurantId}`);
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Delete non-existent restaurant returns 404', async () => {
            const res = await request(app).delete(`/restaurants/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('4. [Fail] Delete with invalid ID format', async () => {
            const res = await request(app).delete(`/restaurants/${invalidId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(500);
        });

        it('5. [Success] Admin successfully deletes the restaurant', async () => {
            const res = await request(app).delete(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'Updated Burger'); // We return the deleted object in delete
        });

        it('6. [Success] Verify restaurant is actually removed (GET returns 404)', async () => {
            const res = await request(app).get(`/restaurants/${testRestaurantId}`);
            expect(res.status).toBe(404);
        });

        it('7. [Fail] Admin tries to delete the same restaurant twice (404)', async () => {
            const res = await request(app).delete(`/restaurants/${testRestaurantId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });

        it('8. [Success] Can delete another newly created restaurant without issues', async () => {
            // Create a new restaurant
            const createRes = await request(app).post('/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: "Temp", location: { lat: 1, lng: 1 } });
            const tempId = createRes.body._id;

            // Delete it
            const deleteRes = await request(app).delete(`/restaurants/${tempId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(deleteRes.status).toBe(200);
        });
    });
});