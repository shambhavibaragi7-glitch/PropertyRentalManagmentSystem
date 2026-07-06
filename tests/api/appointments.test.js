const request = require('supertest');
const app = require('../../server');
const db = require('../../db');

jest.mock('../../db');

describe('Appointments API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/appointments', () => {
        it('should successfully book an appointment and create a notification message for the manager', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            const appointmentData = {
                managerId: 1,
                tenantId: 2,
                appointmentDate: '2026-07-10T10:00',
                description: 'Would like to view the 2BHK apartment'
            };

            const response = await request(app)
                .post('/api/appointments')
                .set('Accept-Language', 'en')
                .send(appointmentData);

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');

            // Verify db.query was called for inserting into appointment
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO appointment'),
                expect.arrayContaining([1, 2, expect.any(String), 'Would like to view the 2BHK apartment'])
            );

            // Verify db.query was called for inserting notification into messageManager
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO messageManager'),
                expect.arrayContaining([
                    1,
                    2,
                    expect.stringContaining('Appointment booked for')
                ])
            );
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/appointments')
                .send({
                    managerId: 1
                });

            expect(response.status).toBe(400);
        });

        it('should return 400 for invalid date format', async () => {
            const response = await request(app)
                .post('/api/appointments')
                .send({
                    managerId: 1,
                    tenantId: 2,
                    appointmentDate: 'invalid-date',
                    description: 'View apartment'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/appointments', () => {
        it('should return appointments with tenant details (name, email, phone)', async () => {
            db.query.mockResolvedValue([
                {
                    appointmentId: 1,
                    managerId: 1,
                    tenantId: 2,
                    appointmentDate: '2026-07-10 10:00:00',
                    description: 'View apartment',
                    managerName: 'Edna Mode',
                    tenantName: 'Forrest Gump',
                    tenantEmail: 'forrestgump@gmail.com',
                    tenantPhone: '4381110055'
                }
            ]);

            const response = await request(app)
                .get('/api/appointments')
                .query({ manager_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data[0].tenantName).toBe('Forrest Gump');
            expect(response.body.data[0].tenantEmail).toBe('forrestgump@gmail.com');
            expect(response.body.data[0].tenantPhone).toBe('4381110055');
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('tenantPhone'),
                expect.any(Array)
            );
        });
    });
});
