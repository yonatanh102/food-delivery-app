const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app'); 

// Import the tcpClient so we can mock its behavior and check if it was called
const tcpClient = require('../src/tcpClient');

// MOCK THE TCP CLIENT
// We implement a custom mock logic to simulate the C++ server responses
jest.mock('../src/tcpClient', () => ({
    sendCommand: jest.fn()
}));

// Mock tokens for authentication
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';
const mockUserId = new mongoose.Types.ObjectId().toString();
const clientToken = jwt.sign({ userId: mockUserId, role: 'client' }, JWT_SECRET, { expiresIn: '1h' });
const testItemId = 'prod_123';

describe('Recommendations API Tests', () => {

    beforeEach(() => {
        // Clear all mock history before each test to ensure they don't affect each other
        jest.clearAllMocks();
    });

    // ==========================================
    // 1. READ (GET /recommendations) - 7 Tests
    // ==========================================
    describe('GET /recommendations', () => {
        
        it('1. [Success] Authenticated user successfully fetches recommendations', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('prod_123 prod_456');

            const res = await request(app).get(`/recommendations?itemId=${testItemId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toContain('prod_123');
            
            // Verify that the correct command was sent to the TCP server
            expect(tcpClient.sendCommand).toHaveBeenCalledWith(`RECOMMEND ${mockUserId} ${testItemId}`);
        });

        it('2. [Fail] Unauthenticated user cannot fetch recommendations (401)', async () => {
            const res = await request(app).get(`/recommendations?itemId=${testItemId}`);
            expect(res.status).toBe(401);
            expect(tcpClient.sendCommand).not.toHaveBeenCalled();
        });

        it('3. [Fail] Missing "Bearer" in Authorization header gets blocked', async () => {
            const res = await request(app).get(`/recommendations?itemId=${testItemId}`)
                .set('Authorization', clientToken);
            expect(res.status).toBe(401);
            expect(tcpClient.sendCommand).not.toHaveBeenCalled();
        });

        it('4. [Fail] Invalid JWT token is rejected (400)', async () => {
            const res = await request(app).get(`/recommendations?itemId=${testItemId}`)
                .set('Authorization', 'Bearer fake.token.here');
            expect(res.status).toBe(400); 
        });

        it('5. [Fail] Missing itemId parameter throws 400', async () => {
            const res = await request(app).get('/recommendations')
                .set('Authorization', `Bearer ${clientToken}`);
            
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Missing required parameters/i);
        });

        it('6. [Fail] Handles TCP server connection error (500)', async () => {
            tcpClient.sendCommand.mockRejectedValueOnce(new Error('TCP Connection Failed'));

            const res = await request(app).get(`/recommendations?itemId=${testItemId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            
            expect(res.status).toBe(500);
            expect(res.body.error).toMatch(/Internal server error/i);
        });

        it('7. [Success] Validates that no command injection occurs in TCP request', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('ok');

            await request(app).get(`/recommendations?itemId=${testItemId}`)
                .set('Authorization', `Bearer ${clientToken}`);
            
            const lastCallArgs = tcpClient.sendCommand.mock.calls[0][0];
            expect(lastCallArgs).toMatch(/^RECOMMEND [a-zA-Z0-9_]+ [a-zA-Z0-9_]+$/);
        });
    });
});