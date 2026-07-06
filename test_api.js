const http = require('http');

const PORT = 8000;

// Helper to perform HTTP requests
function apiRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({ statusCode: res.statusCode, body: parsed });
            });
        });

        req.on('error', (err) => reject(err));
        if (body) {
            req.write(payload);
        }
        req.end();
    });
}

async function runTests() {
    console.log('=== Starting PMS Backend API Integration Tests ===\n');
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (err) {
            console.error(`[FAIL] ${name}`);
            console.error(err);
            failed++;
        }
    }

    // 1. Test standard login (Manager by Registration Number)
    await test('Property Manager standard login (PM-1)', async () => {
        const res = await apiRequest('/api/auth/login', 'POST', {
            role: 'manager',
            registrationNumber: 'PM-1',
            password: 'password123'
        });
        if (res.statusCode !== 200 || res.body.status !== 'success' || res.body.role !== 'manager') {
            throw new Error(`Expected successful manager login, got: ${JSON.stringify(res)}`);
        }
    });

    // 2. Test auto-registration on login (Tenant with Name)
    const testEmail = `tenant_${Date.now()}@test.com`;
    await test('Tenant standard login auto-registration', async () => {
        const res = await apiRequest('/api/auth/login', 'POST', {
            role: 'tenant',
            email: testEmail,
            password: 'password123',
            name: 'Test Tenant User'
        });
        if (res.statusCode !== 200 || res.body.user.name !== 'Test Tenant User' || res.body.role !== 'tenant') {
            throw new Error(`Expected successful tenant registration, got: ${JSON.stringify(res)}`);
        }
    });

    // 3. Test OTP generation (Owner)
    let generatedOtp = '';
    const ownerEmail = 'tylerdurden@gmail.com';
    await test('Request Owner Login OTP', async () => {
        const res = await apiRequest('/api/auth/send-otp', 'POST', {
            role: 'owner',
            email: ownerEmail
        });
        if (res.statusCode !== 200 || !res.body.otp) {
            throw new Error(`Expected OTP generation, got: ${JSON.stringify(res)}`);
        }
        generatedOtp = res.body.otp;
    });

    // 4. Test OTP verification (Owner)
    await test('Verify Owner Login OTP', async () => {
        if (!generatedOtp) throw new Error('No OTP generated to verify.');
        const res = await apiRequest('/api/auth/verify-otp', 'POST', {
            role: 'owner',
            email: ownerEmail,
            otp: generatedOtp
        });
        if (res.statusCode !== 200 || res.body.user.email !== ownerEmail) {
            throw new Error(`Expected successful OTP verification, got: ${JSON.stringify(res)}`);
        }
    });

    // 5. Test Password Reset flow
    let resetOtp = '';
    await test('Forgot Password OTP generation', async () => {
        const res = await apiRequest('/api/auth/send-otp', 'POST', {
            role: 'owner',
            email: ownerEmail
        });
        if (res.statusCode !== 200 || !res.body.otp) {
            throw new Error(`Expected OTP generation, got: ${JSON.stringify(res)}`);
        }
        resetOtp = res.body.otp;
    });

    await test('Verify Forgot Password OTP with flow check', async () => {
        if (!resetOtp) throw new Error('No OTP generated for reset verification.');
        const res = await apiRequest('/api/auth/verify-otp', 'POST', {
            role: 'owner',
            email: ownerEmail,
            otp: resetOtp,
            flow: 'forgot'
        });
        if (res.statusCode !== 200) {
            throw new Error(`Expected valid OTP check, got: ${JSON.stringify(res)}`);
        }
    });

    const newTestPassword = 'updatedpassword123';
    await test('Reset Password via OTP token', async () => {
        if (!resetOtp) throw new Error('No OTP generated for password reset.');
        const res = await apiRequest('/api/auth/reset-password', 'POST', {
            role: 'owner',
            email: ownerEmail,
            otp: resetOtp,
            newPassword: newTestPassword
        });
        if (res.statusCode !== 200 || res.body.status !== 'success') {
            throw new Error(`Expected successful password reset, got: ${JSON.stringify(res)}`);
        }
    });

    await test('Login with standard credentials using new password', async () => {
        const res = await apiRequest('/api/auth/login', 'POST', {
            role: 'owner',
            email: ownerEmail,
            password: newTestPassword
        });
        if (res.statusCode !== 200 || res.body.status !== 'success') {
            throw new Error(`Expected standard login with new password to succeed, got: ${JSON.stringify(res)}`);
        }
    });

    // 6. Test Analytics Endpoint
    await test('Fetch Occupancy and Rental Analysis', async () => {
        const res = await apiRequest('/api/analytics/occupancy');
        if (res.statusCode !== 200 || !res.body.metrics) {
            throw new Error(`Expected occupancy metrics, got: ${JSON.stringify(res)}`);
        }
    });

    console.log(`\n=== Test Run Completed ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runTests().catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
});
