const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

function sha256Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

// GET /api/tenants
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const search = req.query.search;

    let queryStr = "SELECT tenantId, name, email, phoneNumber FROM tenant WHERE 1=1";
    let params = [];

    if (search) {
        queryStr += " AND email LIKE ?";
        params.append(`%${search}%`);
    }

    try {
        const tenants = await db.query(queryStr, params);
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: tenants.length,
            data: tenants
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// GET /api/tenants/:id
router.get('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const tenantId = req.params.id;
    try {
        const tenantObj = await db.fetchOne("SELECT tenantId, name, email, phoneNumber FROM tenant WHERE tenantId = ?", [tenantId]);
        if (!tenantObj) {
            return res.status(404).json({ detail: "Tenant not found." });
        }
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            data: tenantObj
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/tenants
router.post('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ detail: "Name, email, password, and phoneNumber are required." });
    }

    try {
        const exists = await db.fetchOne("SELECT 1 as val FROM tenant WHERE email = ?", [email]);
        if (exists) {
            return res.status(400).json({ detail: "This email is already in use by another tenant." });
        }

        const hashedPwd = sha256Hash(password);
        await db.query(
            "INSERT INTO tenant (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)",
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

// PUT /api/tenants/:id
router.put('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const tenantId = req.params.id;
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
        return res.status(400).json({ detail: "Name, email, and phoneNumber are required." });
    }

    try {
        const existing = await db.fetchOne("SELECT password FROM tenant WHERE tenantId = ?", [tenantId]);
        if (!existing) {
            return res.status(404).json({ detail: "Tenant not found." });
        }

        const emailExists = await db.fetchOne("SELECT 1 as val FROM tenant WHERE email = ? AND tenantId != ?", [email, tenantId]);
        if (emailExists) {
            return res.status(400).json({ detail: "This email is already in use by another tenant." });
        }

        const hashedPwd = password ? sha256Hash(password) : existing.password;
        await db.query(
            "UPDATE tenant SET name = ?, email = ?, password = ?, phoneNumber = ? WHERE tenantId = ?",
            [name, email, hashedPwd, phoneNumber, tenantId]
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

// DELETE /api/tenants/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const tenantId = req.params.id;

    try {
        const aptCount = await db.fetchOne("SELECT COUNT(*) AS total FROM apartment WHERE tenantId = ?", [tenantId]);
        const apptCount = await db.fetchOne("SELECT COUNT(*) AS total FROM appointment WHERE tenantId = ?", [tenantId]);
        const msgCount = await db.fetchOne("SELECT COUNT(*) AS total FROM messageManager WHERE tenantId = ?", [tenantId]);

        const hasApts = aptCount && aptCount.total > 0;
        const hasAppts = apptCount && apptCount.total > 0;
        const hasMsgs = msgCount && msgCount.total > 0;

        if (hasApts || hasAppts || hasMsgs) {
            return res.status(400).json({
                detail: "This tenant cannot be deleted because they are assigned to apartments, messages, or appointments."
            });
        }

        await db.query("DELETE FROM tenant WHERE tenantId = ?", [tenantId]);

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
