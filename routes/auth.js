const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function validatePassword(password) {
    if (typeof password !== 'string') return false;
    if (password.length !== 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
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
            if (!user || user.password !== hashedPwd) {
                return res.status(401).json({ detail: "Invalid Email or Password" });
            }
        } else {
            if (!email) {
                return res.status(400).json({ detail: "Email is required for login." });
            }
            user = await db.fetchOne(`SELECT * FROM [${lowerRole}] WHERE email = ?`, [email]);
            if (!user || user.password !== hashedPwd) {
                return res.status(401).json({ detail: "Invalid Email or Password" });
            }
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
                return res.status(404).json({ detail: "Registration number not found." });
            }
        } else {
            user = await db.fetchOne(`SELECT * FROM [${lowerRole}] WHERE email = ?`, [identifier]);
            if (!user) {
                return res.status(404).json({ detail: "Email address not found." });
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
    
    if (!validatePassword(newPassword)) {
        return res.status(400).json({ detail: "Password must be exactly 8 characters long and contain at least one uppercase letter, one lowercase letter, and one numeric digit." });
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

    if (!validatePassword(password)) {
        return res.status(400).json({ detail: "Password must be exactly 8 characters long and contain at least one uppercase letter, one lowercase letter, and one numeric digit." });
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

    if (!validatePassword(password)) {
        return res.status(400).json({ detail: "Password must be exactly 8 characters long and contain at least one uppercase letter, one lowercase letter, and one numeric digit." });
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
