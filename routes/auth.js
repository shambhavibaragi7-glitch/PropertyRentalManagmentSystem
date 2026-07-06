const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// In-memory mock OTP storage
// Structure: { [identifier]: { otp: '123456', expiresAt: timestamp } }
const pendingOtps = new Map();

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { role, email, registrationNumber, password, name } = req.body;

    if (!role || !password) {
        return res.status(400).json({ detail: "Role and password are required." });
    }

    const lowerRole = role.toLowerCase();
    if (!['owner', 'manager', 'tenant'].includes(lowerRole)) {
        return res.status(400).json({ detail: "Invalid role specified." });
    }

    const hashedPwd = sha256Hash(password);

    try {
        let user;
        if (lowerRole === 'manager') {
            if (!registrationNumber) {
                return res.status(400).json({ detail: "Registration number is required for manager login." });
            }
            user = await db.fetchOne("SELECT * FROM manager WHERE registrationNumber = ?", [registrationNumber]);
            if (!user) {
                // Auto-register manager
                const defaultName = `Manager ${registrationNumber}`;
                const defaultEmail = `${registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@manager.com`.slice(0, 50);
                const defaultPhone = "1234567890";
                await db.query(
                    "INSERT INTO manager (name, email, password, phoneNumber, registrationNumber) VALUES (?, ?, ?, ?, ?)",
                    [defaultName, defaultEmail, hashedPwd, defaultPhone, registrationNumber]
                );
                user = await db.fetchOne("SELECT * FROM manager WHERE registrationNumber = ?", [registrationNumber]);
            } else {
                // Update/autosave password
                await db.query(
                    "UPDATE manager SET password = ? WHERE registrationNumber = ?",
                    [hashedPwd, registrationNumber]
                );
                user.password = hashedPwd;
            }
        } else {
            if (!email) {
                return res.status(400).json({ detail: "Email is required for login." });
            }
            user = await db.fetchOne(`SELECT * FROM [${lowerRole}] WHERE email = ?`, [email]);
            if (!user) {
                // Auto-register owner or tenant
                const defaultName = (name && name.trim()) ? name.trim().slice(0, 50) : email.split('@')[0]
                    .replace(/[^a-zA-Z0-9]/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase())
                    .slice(0, 50);
                const defaultPhone = "1234567890";
                await db.query(
                    `INSERT INTO [${lowerRole}] (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)`,
                    [defaultName, email, hashedPwd, defaultPhone]
                );
                user = await db.fetchOne(`SELECT * FROM [${lowerRole}] WHERE email = ?`, [email]);
            } else {
                // Update/autosave password
                await db.query(
                    `UPDATE [${lowerRole}] SET password = ? WHERE email = ?`,
                    [hashedPwd, email]
                );
                user.password = hashedPwd;
            }
        }

        if (!user) {
            return res.status(401).json({ detail: "Authentication failed." });
        }

        // Remove password from response
        delete user.password;

        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            role: lowerRole,
            user: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    const { role, email, registrationNumber } = req.body;
    
    if (!role) {
        return res.status(400).json({ detail: "Role is required." });
    }
    
    const lowerRole = role.toLowerCase();
    const isManager = (lowerRole === 'manager');
    const identifier = isManager ? registrationNumber : email;
    
    if (!identifier) {
        return res.status(400).json({ detail: isManager ? "Registration number is required." : "Email is required." });
    }
    
    try {
        let user;
        if (isManager) {
            user = await db.fetchOne("SELECT * FROM manager WHERE registrationNumber = ?", [identifier]);
            if (!user) {
                // Auto-create manager so that OTP login succeeds
                const defaultName = `Manager ${identifier}`;
                const defaultEmail = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@manager.com`.slice(0, 50);
                const defaultPhone = "1234567890";
                const dummyPassword = sha256Hash("password123");
                await db.query(
                    "INSERT INTO manager (name, email, password, phoneNumber, registrationNumber) VALUES (?, ?, ?, ?, ?)",
                    [defaultName, defaultEmail, dummyPassword, defaultPhone, identifier]
                );
            }
        } else {
            user = await db.fetchOne(`SELECT * FROM [${lowerRole}] WHERE email = ?`, [identifier]);
            if (!user) {
                // Auto-create owner or tenant
                const defaultName = identifier.split('@')[0]
                    .replace(/[^a-zA-Z0-9]/g, ' ')
                    .replace(/\b\w/g, c => c.toUpperCase())
                    .slice(0, 50);
                const defaultPhone = "1234567890";
                const dummyPassword = sha256Hash("password123");
                await db.query(
                    `INSERT INTO [${lowerRole}] (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)`,
                    [defaultName, identifier, dummyPassword, defaultPhone]
                );
            }
        }
        
        // Generate mock OTP
        const otpCode = generateOtp();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration
        
        pendingOtps.set(identifier.toLowerCase(), { otp: otpCode, expiresAt });
        
        console.log(`[MOCK OTP] Sent OTP code '${otpCode}' for identifier '${identifier}' (${role})`);
        
        res.json({
            status: "success",
            message: "OTP sent successfully.",
            otp: otpCode // returned in response for mock/test display ease
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { role, email, registrationNumber, otp, flow } = req.body;
    
    if (!role || !otp) {
        return res.status(400).json({ detail: "Role and OTP code are required." });
    }
    
    const lowerRole = role.toLowerCase();
    const isManager = (lowerRole === 'manager');
    const identifier = isManager ? registrationNumber : email;
    
    if (!identifier) {
        return res.status(400).json({ detail: isManager ? "Registration number is required." : "Email is required." });
    }
    
    const stored = pendingOtps.get(identifier.toLowerCase());
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
        return res.status(401).json({ detail: "Invalid or expired OTP." });
    }
    
    // Valid OTP, log in user
    try {
        let user;
        if (isManager) {
            user = await db.fetchOne("SELECT * FROM manager WHERE registrationNumber = ?", [identifier]);
        } else {
            user = await db.fetchOne(`SELECT * FROM [${lowerRole}] WHERE email = ?`, [identifier]);
        }
        
        if (!user) {
            return res.status(404).json({ detail: "User record not found." });
        }
        
        // Clear OTP if not forgot password flow
        if (flow !== 'forgot') {
            pendingOtps.delete(identifier.toLowerCase());
        }
        
        delete user.password;
        
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            role: lowerRole,
            user: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { role, email, registrationNumber, otp, newPassword } = req.body;
    
    if (!role || !otp || !newPassword) {
        return res.status(400).json({ detail: "Role, OTP, and newPassword are required." });
    }
    
    const lowerRole = role.toLowerCase();
    const isManager = (lowerRole === 'manager');
    const identifier = isManager ? registrationNumber : email;
    
    if (!identifier) {
        return res.status(400).json({ detail: isManager ? "Registration number is required." : "Email is required." });
    }
    
    const stored = pendingOtps.get(identifier.toLowerCase());
    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
        return res.status(401).json({ detail: "Invalid or expired OTP." });
    }
    
    try {
        const hashedPwd = sha256Hash(newPassword);
        
        if (isManager) {
            const exists = await db.fetchOne("SELECT 1 FROM manager WHERE registrationNumber = ?", [identifier]);
            if (!exists) {
                return res.status(404).json({ detail: "Manager registration number not found." });
            }
            await db.query("UPDATE manager SET password = ? WHERE registrationNumber = ?", [hashedPwd, identifier]);
        } else {
            const exists = await db.fetchOne(`SELECT 1 FROM [${lowerRole}] WHERE email = ?`, [identifier]);
            if (!exists) {
                return res.status(404).json({ detail: "Email address not found." });
            }
            await db.query(`UPDATE [${lowerRole}] SET password = ? WHERE email = ?`, [hashedPwd, identifier]);
        }
        
        pendingOtps.delete(identifier.toLowerCase());
        
        res.json({
            status: "success",
            message: "Password reset successfully."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/auth/register/owner
router.post('/register/owner', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ detail: "Name, email, and password are required." });
    }

    try {
        const exists = await db.fetchOne("SELECT 1 as val FROM owner WHERE email = ?", [email]);
        if (exists) {
            return res.status(400).json({ detail: "This email is already in use. Please use a different email." });
        }

        const hashedPwd = sha256Hash(password);
        await db.query(
            "INSERT INTO owner (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)",
            [name, email, hashedPwd, phoneNumber || null]
        );

        res.json({
            status: "success",
            message: localizations.translate("success", locale)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/auth/register/tenant
router.post('/register/tenant', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ detail: "Name, email, and password are required." });
    }

    try {
        const exists = await db.fetchOne("SELECT 1 as val FROM tenant WHERE email = ?", [email]);
        if (exists) {
            return res.status(400).json({ detail: "This email is already in use. Please use a different email." });
        }

        const hashedPwd = sha256Hash(password);
        await db.query(
            "INSERT INTO tenant (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)",
            [name, email, hashedPwd, phoneNumber || null]
        );

        res.json({
            status: "success",
            message: localizations.translate("success", locale)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

module.exports = router;
