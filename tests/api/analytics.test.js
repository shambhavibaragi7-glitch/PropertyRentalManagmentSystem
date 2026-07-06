const request = require('supertest');
const app = require('../../server');
const db = require('../../db');

jest.mock('../../db');

describe('GET /api/analytics/occupancy', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return successfully with correct metrics when DB returns data', async () => {
        db.fetchOne.mockImplementation((sql, params) => {
            if (sql.includes('tenantId IS NOT NULL')) {
                return Promise.resolve({ total: 8 });
            }
            return Promise.resolve({ total: 10 });
        });

        const response = await request(app)
            .get('/api/analytics/occupancy')
            .set('Accept-Language', 'en');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.metrics).toEqual([
            { label: 'Total Apartments', value: 10 },
            { label: 'Occupied Apartments', value: 8 },
            { label: 'Vacant Apartments', value: 2 },
            { label: 'Occupancy Rate', value: '80.00%' }
        ]);
    });

    it('should default values to 0 when DB returns nothing', async () => {
        db.fetchOne.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/analytics/occupancy')
            .set('Accept-Language', 'en');

        expect(response.status).toBe(200);
        expect(response.body.metrics).toEqual([
            { label: 'Total Apartments', value: 0 },
            { label: 'Occupied Apartments', value: 0 },
            { label: 'Vacant Apartments', value: 0 },
            { label: 'Occupancy Rate', value: '0.00%' }
        ]);
    });

    it('should return 500 when database error occurs', async () => {
        db.fetchOne.mockRejectedValue(new Error('DB Connection Timeout'));

        const response = await request(app)
            .get('/api/analytics/occupancy');

        expect(response.status).toBe(500);
        expect(response.body.detail).toBe('DB Connection Timeout');
    });
});
