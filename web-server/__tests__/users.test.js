const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app'); // Ensure the path to your app.js is correct

// Define helper variables for tests
let testUserId;
let validAuthToken; // Will hold the token received after login
const nonExistentId = new mongoose.Types.ObjectId().toString(); 
const invalidId = 'invalid-mongo-id'; 

// Test user data
const validUserData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    address: "123 Test St",
    location: { lat: 31.25, lng: 35.21 },
    phone: "050-1234567"
};

beforeAll(async () => {
    // Connect to a dedicated test database
    const testMongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/food_test_db';
    await mongoose.connect(testMongoUri);
});

afterAll(async () => {
    // Clean up the users collection after tests
    await mongoose.connection.collection('users').deleteMany({});
    await mongoose.connection.close();
});

describe('Users API Tests', () => {

    // ==========================================
    // 1. REGISTER (POST /users) - 8 Tests
    // ==========================================
    describe('POST /users (Register)', () => {
        it('1. [Success] Should register a new valid user', async () => {
            const res = await request(app).post('/users').send(validUserData);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.email).toBe(validUserData.email);
            expect(res.body).toHaveProperty('role', 'client'); // Default role check
            
            testUserId = res.body._id; // Save ID for later tests
        });

        it('2. [Fail] Should not allow registration with an existing email (409)', async () => {
            const res = await request(app).post('/users').send(validUserData);
            expect(res.status).toBe(409); // Conflict
            expect(res.body.error).toMatch(/email/i);
        });

        it('3. [Fail] Should reject missing required field "email"', async () => {
            const res = await request(app).post('/users').send({
                name: "Jane", password: "pass", address: "St", phone: "123"
            });
            expect(res.status).toBe(500); // Or 400 depending on your error handler
        });

        it('4. [Fail] Should reject invalid email format (Mongoose Validation)', async () => {
            const res = await request(app).post('/users').send({
                ...validUserData, email: "invalid-email-format", phone: "050-9999999"
            });
            expect(res.status).toBe(500);
            expect(res.body.message).toMatch(/valid email/i);
        });

        it('5. [Fail] Should reject password shorter than 6 characters', async () => {
            const res = await request(app).post('/users').send({
                ...validUserData, email: "new@example.com", password: "123", phone: "050-8888888"
            });
            expect(res.status).toBe(500);
            expect(res.body.message).toMatch(/password/i);
        });

        it('6. [Fail] Should reject missing required field "password"', async () => {
            const res = await request(app).post('/users').send({
                name: "Jane", email: "jane@test.com", address: "St", phone: "123"
            });
            expect(res.status).toBe(500);
        });

        it('7. [Fail] Should not expose plain text password in response', async () => {
            const res = await request(app).post('/users').send({
                ...validUserData, email: "secure@example.com", phone: "050-7777777"
            });
            expect(res.status).toBe(201);
            // Ensure the returned object either doesn't have password, or it's hashed
            if (res.body.password) {
                expect(res.body.password).not.toBe(validUserData.password);
            }
        });

        it('8. [Fail] Should reject duplicate phone number', async () => {
             // Assuming phone is unique in schema
             const res = await request(app).post('/users').send({
                ...validUserData, email: "another@example.com", phone: validUserData.phone 
            });
            expect(res.status).toBe(409); // Unique constraint error
        });
    });

    // ==========================================
    // 2. LOGIN (POST /users/login) - 5 Tests
    // ==========================================
    describe('POST /users/login', () => {
        it('1. [Success] Should login successfully with correct credentials', async () => {
            const res = await request(app).post('/users/login').send({
                email: validUserData.email,
                password: validUserData.password
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.message).toMatch(/successful/i);
            
            validAuthToken = res.body.token; // Save the real token for protected routes!
        });

        it('2. [Fail] Should reject login with non-existent email', async () => {
            const res = await request(app).post('/users/login').send({
                email: "nobody@example.com",
                password: validUserData.password
            });
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Should reject login with wrong password', async () => {
            const res = await request(app).post('/users/login').send({
                email: validUserData.email,
                password: "WrongPassword!"
            });
            expect(res.status).toBe(401);
        });

        it('4. [Fail] Should reject login missing email', async () => {
            const res = await request(app).post('/users/login').send({
                password: validUserData.password
            });
            expect(res.status).toBe(401); // Or 400 / 500 depending on controller logic
        });

        it('5. [Fail] Should reject login missing password', async () => {
            const res = await request(app).post('/users/login').send({
                email: validUserData.email
            });
            expect(res.status).toBe(401);
        });
    });

    // ==========================================
    // 3. READ ALL (GET /users) - 5 Tests
    // ==========================================
    describe('GET /users', () => {
        it('1. [Success] Should fetch all users when authenticated', async () => {
            const res = await request(app).get('/users')
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });

        it('2. [Fail] Should block access without a token (401)', async () => {
            const res = await request(app).get('/users');
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/Access denied/i);
        });

        it('3. [Fail] Should block access with an invalid/fake token (400)', async () => {
            const res = await request(app).get('/users')
                .set('Authorization', `Bearer fake.jwt.token`);
            expect(res.status).toBe(400); // Handled by verifyToken middleware catch block
        });

        it('4. [Success] Array contains the previously registered user', async () => {
            const res = await request(app).get('/users')
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            expect(res.body[0]).toHaveProperty('email');
        });

        it('5. [Fail] Missing "Bearer " prefix in Authorization header', async () => {
            const res = await request(app).get('/users')
                .set('Authorization', validAuthToken); // Sent without 'Bearer '
            expect(res.status).toBe(401);
        });
    });

    // ==========================================
    // 4. READ ONE (GET /users/:id) - 5 Tests
    // ==========================================
    describe('GET /users/:id', () => {
        it('1. [Success] Should fetch a specific user by ID', async () => {
            const res = await request(app).get(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(200);
            expect(res.body._id).toBe(testUserId);
            expect(res.body.email).toBe(validUserData.email);
        });

        it('2. [Fail] Unauthenticated user cannot fetch (401)', async () => {
            const res = await request(app).get(`/users/${testUserId}`);
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Valid MongoDB ID but user not found (404)', async () => {
            const res = await request(app).get(`/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(404);
        });

        it('4. [Fail] Invalid ID format throws error', async () => {
            const res = await request(app).get(`/users/${invalidId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(500);
        });

        it('5. [Success] Data structure includes expected fields (name, email, role)', async () => {
            const res = await request(app).get(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('role');
        });
    });

    // ==========================================
    // 5. UPDATE (PUT /users/:id) - 6 Tests
    // ==========================================
    describe('PUT /users/:id', () => {
        it('1. [Success] Should update user data successfully', async () => {
            const res = await request(app).put(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`)
                .send({ name: "John Updated", address: "456 New St" });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe("John Updated");
            expect(res.body.address).toBe("456 New St");
        });

        it('2. [Fail] Unauthenticated user cannot update', async () => {
            const res = await request(app).put(`/users/${testUserId}`)
                .send({ name: "Hacker" });
            expect(res.status).toBe(401);
        });

        it('3. [Fail] Should return 404 for non-existent user update', async () => {
            const res = await request(app).put(`/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${validAuthToken}`)
                .send({ name: "Does not exist" });
            expect(res.status).toBe(404);
        });

        it('4. [Fail] Should fail with invalid ID format', async () => {
            const res = await request(app).put(`/users/${invalidId}`)
                .set('Authorization', `Bearer ${validAuthToken}`)
                .send({ name: "Fail" });
            expect(res.status).toBe(500);
        });

        it('5. [Success] Unchanged fields remain intact after update', async () => {
            const res = await request(app).get(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.body.email).toBe(validUserData.email); // Email wasn't updated
        });

        it('6. [Fail] Should respect schema validations on update (e.g., empty string for required)', async () => {
            const res = await request(app).put(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`)
                .send({ name: null }); 
            expect(res.status).toBe(500);
        });
    });

    // ==========================================
    // 6. DELETE (DELETE /users/:id) - 5 Tests
    // ==========================================
    describe('DELETE /users/:id', () => {
        it('1. [Fail] Unauthenticated user cannot delete', async () => {
            const res = await request(app).delete(`/users/${testUserId}`);
            expect(res.status).toBe(401);
        });

        it('2. [Fail] Should return 404 for non-existent user deletion', async () => {
            const res = await request(app).delete(`/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(404);
        });

        it('3. [Fail] Should fail with invalid ID format', async () => {
            const res = await request(app).delete(`/users/${invalidId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(500);
        });

        it('4. [Success] Should successfully delete the user', async () => {
            const res = await request(app).delete(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/deleted successfully/i);
        });

        it('5. [Success] Verify user is actually removed (GET returns 404)', async () => {
            const res = await request(app).get(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${validAuthToken}`);
            expect(res.status).toBe(404);
        });
    });
});