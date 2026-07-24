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

// GET /api/managers
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    try {
        const managers = await db.query("SELECT managerId, name, email, phoneNumber FROM manager");
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: managers.length,
            data: managers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// GET /api/managers/:id
router.get('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const managerId = req.params.id;
    try {
        const mgr = await db.fetchOne("SELECT managerId, name, email, phoneNumber FROM manager WHERE managerId = ?", [managerId]);
        if (!mgr) {
            return res.status(404).json({ detail: "Manager not found." });
        }
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            data: mgr
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/managers
router.post('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ detail: "Name, email, password, and phoneNumber are required." });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ detail: "Password must be exactly 8 characters long and contain at least one uppercase letter, one lowercase letter, and one numeric digit." });
    }

    try {
        const exists = await db.fetchOne("SELECT 1 as val FROM manager WHERE email = ?", [email]);
        if (exists) {
            return res.status(400).json({ detail: "This email is already in use by another manager." });
        }

        const hashedPwd = sha256Hash(password);
        await db.query(
            "INSERT INTO manager (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)",
            [name, email, hashedPwd, phoneNumber]
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

// PUT /api/managers/:id
router.put('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const managerId = req.params.id;
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
        return res.status(400).json({ detail: "Name, email, and phoneNumber are required." });
    }

    if (password && !validatePassword(password)) {
        return res.status(400).json({ detail: "Password must be exactly 8 characters long and contain at least one uppercase letter, one lowercase letter, and one numeric digit." });
    }

    try {
        const existing = await db.fetchOne("SELECT password FROM manager WHERE managerId = ?", [managerId]);
        if (!existing) {
            return res.status(404).json({ detail: "Manager not found." });
        }

        const emailExists = await db.fetchOne("SELECT 1 as val FROM manager WHERE email = ? AND managerId != ?", [email, managerId]);
        if (emailExists) {
            return res.status(400).json({ detail: "This email is already in use by another manager." });
        }

        const hashedPwd = password ? sha256Hash(password) : existing.password;
        await db.query(
            "UPDATE manager SET name = ?, email = ?, password = ?, phoneNumber = ? WHERE managerId = ?",
            [name, email, hashedPwd, phoneNumber, managerId]
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

// DELETE /api/managers/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const managerId = req.params.id;

    try {
        const buildingCount = await db.fetchOne("SELECT COUNT(*) AS total FROM building WHERE managerId = ?", [managerId]);
        const eventCount = await db.fetchOne("SELECT COUNT(*) AS total FROM eventOwner WHERE managerId = ?", [managerId]);
        
        const msgMgrCount = await db.fetchOne("SELECT COUNT(*) AS total FROM messageManager WHERE managerId = ?", [managerId]);
        const msgOwnerCount = await db.fetchOne("SELECT COUNT(*) AS total FROM messageOwner WHERE managerId = ?", [managerId]);
        const apptCount = await db.fetchOne("SELECT COUNT(*) AS total FROM appointment WHERE managerId = ?", [managerId]);

        const hasBuildings = buildingCount && buildingCount.total > 0;
        const hasEvents = eventCount && eventCount.total > 0;
        const hasMsgs = (msgMgrCount && msgMgrCount.total > 0) || (msgOwnerCount && msgOwnerCount.total > 0);
        const hasAppts = apptCount && apptCount.total > 0;

        if (hasBuildings || hasEvents || hasMsgs || hasAppts) {
            return res.status(400).json({
                detail: "This manager cannot be deleted because they are assigned to buildings, events, messages, or appointments. Reassign or delete those records first."
            });
        }

        await db.query("DELETE FROM manager WHERE managerId = ?", [managerId]);

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
