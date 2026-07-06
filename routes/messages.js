const express = require('express');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

// --- Tenant & Manager Messages (messageManager) ---

// GET /api/messages/manager
router.get('/manager', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { manager_id, tenant_id } = req.query;

    let queryStr = `
        SELECT mm.*, m.name as managerName, t.name as tenantName 
        FROM messageManager mm
        JOIN manager m ON mm.managerId = m.managerId
        JOIN tenant t ON mm.tenantId = t.tenantId
        WHERE 1=1
    `;
    let params = [];

    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
        queryStr += " AND mm.managerId = ?";
        params.push(parseInt(manager_id));
    }

    if (tenant_id !== undefined && tenant_id !== null && tenant_id !== '') {
        queryStr += " AND mm.tenantId = ?";
        params.push(parseInt(tenant_id));
    }

    try {
        const msgs = await db.query(queryStr, params);
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: msgs.length,
            data: msgs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/messages/manager
router.post('/manager', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { managerId, tenantId, message } = req.body;

    if (managerId === undefined || tenantId === undefined || !message) {
        return res.status(400).json({ detail: "managerId, tenantId, and message are required." });
    }

    try {
        await db.query(
            "INSERT INTO messageManager (managerId, tenantId, message, responseMessage) VALUES (?, ?, ?, NULL)",
            [managerId, tenantId, message]
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

// PUT /api/messages/manager/:id
router.put('/manager/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const messageId = req.params.id;
    const { role, message, responseMessage } = req.body;

    if (!role) {
        return res.status(400).json({ detail: "role is required." });
    }

    const lowerRole = role.toLowerCase();

    try {
        const existing = await db.fetchOne("SELECT 1 FROM messageManager WHERE messageId = ?", [messageId]);
        if (!existing) {
            return res.status(404).json({ detail: "Message not found." });
        }

        if (lowerRole === 'tenant') {
            await db.query(
                "UPDATE messageManager SET message = ?, responseMessage = NULL WHERE messageId = ?",
                [message, messageId]
            );
        } else if (lowerRole === 'manager') {
            await db.query(
                "UPDATE messageManager SET responseMessage = ? WHERE messageId = ?",
                [responseMessage, messageId]
            );
        } else {
            return res.status(400).json({ detail: "Invalid role for message action." });
        }

        res.json({
            status: "success",
            message: localizations.translate("success", locale)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// DELETE /api/messages/manager/:id
router.delete('/manager/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const messageId = req.params.id;

    try {
        const existing = await db.fetchOne("SELECT 1 FROM messageManager WHERE messageId = ?", [messageId]);
        if (!existing) {
            return res.status(404).json({ detail: "Message not found." });
        }

        await db.query("DELETE FROM messageManager WHERE messageId = ?", [messageId]);
        res.json({
            status: "success",
            message: localizations.translate("success", locale)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});


// --- Owner & Manager Messages (messageOwner) ---

// GET /api/messages/owner
router.get('/owner', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { owner_id, manager_id } = req.query;

    let queryStr = `
        SELECT mo.*, m.name as managerName, o.name as ownerName 
        FROM messageOwner mo
        JOIN manager m ON mo.managerId = m.managerId
        JOIN owner o ON mo.ownerId = o.ownerId
        WHERE 1=1
    `;
    let params = [];

    if (owner_id !== undefined && owner_id !== null && owner_id !== '') {
        queryStr += " AND mo.ownerId = ?";
        params.push(parseInt(owner_id));
    }

    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
        queryStr += " AND mo.managerId = ?";
        params.push(parseInt(manager_id));
    }

    try {
        const msgs = await db.query(queryStr, params);
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: msgs.length,
            data: msgs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/messages/owner
router.post('/owner', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { managerId, ownerId, message } = req.body;

    if (managerId === undefined || ownerId === undefined || !message) {
        return res.status(400).json({ detail: "managerId, ownerId, and message are required." });
    }

    try {
        await db.query(
            "INSERT INTO messageOwner (managerId, ownerId, message, responseMessage) VALUES (?, ?, ?, NULL)",
            [managerId, ownerId, message]
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

// PUT /api/messages/owner/:id
router.put('/owner/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const messageId = req.params.id;
    const { role, message, responseMessage } = req.body;

    if (!role) {
        return res.status(400).json({ detail: "role is required." });
    }

    const lowerRole = role.toLowerCase();

    try {
        const existing = await db.fetchOne("SELECT 1 FROM messageOwner WHERE messageId = ?", [messageId]);
        if (!existing) {
            return res.status(404).json({ detail: "Message not found." });
        }

        if (lowerRole === 'owner') {
            await db.query(
                "UPDATE messageOwner SET message = ? WHERE messageId = ?",
                [message, messageId]
            );
        } else if (lowerRole === 'manager') {
            await db.query(
                "UPDATE messageOwner SET responseMessage = ? WHERE messageId = ?",
                [responseMessage, messageId]
            );
        } else {
            return res.status(400).json({ detail: "Invalid role for message action." });
        }

        res.json({
            status: "success",
            message: localizations.translate("success", locale)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// DELETE /api/messages/owner/:id
router.delete('/owner/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const messageId = req.params.id;

    try {
        const existing = await db.fetchOne("SELECT 1 FROM messageOwner WHERE messageId = ?", [messageId]);
        if (!existing) {
            return res.status(404).json({ detail: "Message not found." });
        }

        await db.query("DELETE FROM messageOwner WHERE messageId = ?", [messageId]);
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
