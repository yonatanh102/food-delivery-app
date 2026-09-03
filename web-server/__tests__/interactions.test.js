const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const tcpClient = require('../src/tcpClient');

jest.mock('../src/tcpClient', () => ({
    sendCommand: jest.fn()
}));

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key_12345';
const mockUserId = new mongoose.Types.ObjectId().toString();
const clientToken = jwt.sign({ userId: mockUserId, role: 'client' }, JWT_SECRET, { expiresIn: '1h' });
const testProductId = new mongoose.Types.ObjectId().toString();

describe('Interactions API Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /interactions/view', () => {
        it('1. [Success] Should send ADD_VIEW command to TCP server', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('201 Created');

            const res = await request(app).post('/interactions/view')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ userId: mockUserId, items: [testProductId] });
            
            expect(res.status).toBe(201);
            expect(res.body.status).toBe('success');
            expect(tcpClient.sendCommand).toHaveBeenCalledWith(`ADD_VIEW ${mockUserId} ${testProductId}`);
        });

        it('2. [Fail] Should reject if items array is missing (400)', async () => {
            const res = await request(app).post('/interactions/view')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ userId: mockUserId });
            
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Missing required parameters/i);
            expect(tcpClient.sendCommand).not.toHaveBeenCalled();
        });

        it('3. [Fail] Should return 400 if TCP server returns an error code', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('400 Bad Request');

            const res = await request(app).post('/interactions/view')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ userId: mockUserId, items: [testProductId] });
            
            expect(res.status).toBe(400);
        });
    });

    describe('POST /interactions/purchase', () => {
        it('1. [Success] Should send ADD_PURCHASE command for multiple items', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('201 Created');
            const item2 = new mongoose.Types.ObjectId().toString();

            const res = await request(app).post('/interactions/purchase')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ userId: mockUserId, items: [testProductId, item2] });
            
            expect(res.status).toBe(201);
            expect(tcpClient.sendCommand).toHaveBeenCalledWith(`ADD_PURCHASE ${mockUserId} ${testProductId} ${item2}`);
        });
    });

    describe('DELETE /interactions/view', () => {
        it('1. [Success] Should send REMOVE_VIEW command', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('200 OK');

            // Replace with your actual route path (e.g., DELETE /interactions/view)
            const res = await request(app).delete('/interactions/view')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ userId: mockUserId, items: [testProductId] });
            
            expect(res.status).toBe(200);
            expect(tcpClient.sendCommand).toHaveBeenCalledWith(`REMOVE_VIEW ${mockUserId} ${testProductId}`);
        });
    });

    describe('DELETE /interactions/purchase', () => {
        it('1. [Success] Should send REMOVE_PURCHASE command', async () => {
            tcpClient.sendCommand.mockResolvedValueOnce('200 OK');

            const res = await request(app).delete('/interactions/purchase')
                .set('Authorization', `Bearer ${clientToken}`)
                .send({ userId: mockUserId, items: [testProductId] });
            
            expect(res.status).toBe(200);
            expect(tcpClient.sendCommand).toHaveBeenCalledWith(`REMOVE_PURCHASE ${mockUserId} ${testProductId}`);
        });
    });
});