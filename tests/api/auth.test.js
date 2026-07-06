const request = require('supertest');
const app = require('../../server');
const db = require('../../db');

jest.mock('../../db');

describe('Auth API Endpoints', () => {
    let mockUsers;

    beforeEach(() => {
        jest.clearAllMocks();

        mockUsers = {
            manager: {
                registrationNumber: 'PM-1',
                password: 'ef92b778bafe771e8929ab57e5377877397c99ebc41990f3c02cf91823031572', // 'password123' sha256
                name: 'Manager PM-1',
                email: 'pm1@manager.com'
            },
            owner: {
                email: 'tylerdurden@gmail.com',
                password: 'ef92b778bafe771e8929ab57e5377877397c99ebc41990f3c02cf91823031572', // 'password123' sha256
                name: 'Tyler Durden'
            }
        };

        // Default mock behaviors for SQL queries
        db.fetchOne.mockImplementation((sql, params) => {
            if (sql.includes('FROM manager WHERE registrationNumber = ?')) {
                const regNum = params[0];
                if (regNum === 'PM-1') return Promise.resolve(mockUsers.manager);
                return Promise.resolve(null);
            }
            if (sql.includes('FROM [owner] WHERE email = ?')) {
                const email = params[0];
                if (email === 'tylerdurden@gmail.com') return Promise.resolve(mockUsers.owner);
                return Promise.resolve(null);
            }
            if (sql.includes('FROM [tenant] WHERE email = ?')) {
                return Promise.resolve(null);
            }
            return Promise.resolve(null);
        });

        db.query.mockResolvedValue({ affectedRows: 1 });
    });

    describe('POST /api/auth/login', () => {
        it('should log in manager PM-1 with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    role: 'manager',
                    registrationNumber: 'PM-1',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(res.body.role).toBe('manager');
            expect(res.body.user.registrationNumber).toBe('PM-1');
        });

        it('should auto-register a manager if they do not exist', async () => {
            // When querying the non-existent manager, first return null, then return the newly inserted user
            let callCount = 0;
            db.fetchOne.mockImplementation((sql, params) => {
                if (sql.includes('FROM manager WHERE registrationNumber = ?')) {
                    callCount++;
                    if (callCount === 1) {
                        return Promise.resolve(null);
                    }
                    return Promise.resolve({
                        registrationNumber: 'PM-NEW',
                        name: 'Manager PM-NEW',
                        email: 'pmnew@manager.com'
                    });
                }
                return Promise.resolve(null);
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    role: 'manager',
                    registrationNumber: 'PM-NEW',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('success');
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO manager'),
                expect.any(Array)
            );
        });

        it('should return 400 for missing role or password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    role: 'manager'
                });

            expect(res.status).toBe(400);
            expect(res.body.detail).toBe('Role and password are required.');
        });

        it('should return 400 for invalid role', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    role: 'guest',
                    password: 'test'
                });

            expect(res.status).toBe(400);
            expect(res.body.detail).toBe('Invalid role specified.');
        });
    });

    describe('OTP Generation, Verification and Reset password flow', () => {
        it('should successfully perform OTP generation, validation and password reset', async () => {
            // 1. Generate OTP
            const sendRes = await request(app)
                .post('/api/auth/send-otp')
                .send({
                    role: 'owner',
                    email: 'tylerdurden@gmail.com'
                });

            expect(sendRes.status).toBe(200);
            expect(sendRes.body.otp).toBeDefined();
            const otpVal = sendRes.body.otp;

            // 2. Verify OTP with 'forgot' flow so OTP is preserved for reset
            const verifyRes = await request(app)
                .post('/api/auth/verify-otp')
                .send({
                    role: 'owner',
                    email: 'tylerdurden@gmail.com',
                    otp: otpVal,
                    flow: 'forgot'
                });

            expect(verifyRes.status).toBe(200);
            expect(verifyRes.body.user.email).toBe('tylerdurden@gmail.com');

            // 3. Reset Password
            const resetRes = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    role: 'owner',
                    email: 'tylerdurden@gmail.com',
                    otp: otpVal,
                    newPassword: 'updatedpassword123'
                });

            expect(resetRes.status).toBe(200);
            expect(resetRes.body.status).toBe('success');
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE [owner] SET password = ?'),
                expect.any(Array)
            );
        });

        it('should fail verification with invalid OTP', async () => {
            const verifyRes = await request(app)
                .post('/api/auth/verify-otp')
                .send({
                    role: 'owner',
                    email: 'tylerdurden@gmail.com',
                    otp: '000000'
                });

            expect(verifyRes.status).toBe(401);
            expect(verifyRes.body.detail).toBe('Invalid or expired OTP.');
        });
    });
});
