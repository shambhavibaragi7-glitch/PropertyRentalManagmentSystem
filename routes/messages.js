const express = require('express');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

// --- Tenant & Manager Messages (messageManager) ---

// GET /api/messages/manager
router.get('/manager', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { manager_id, tenant_id } = req.query;
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    let effectiveTenantId = tenant_id;
    let effectiveManagerId = manager_id;

    if (reqRole === 'tenant') {
        effectiveTenantId = reqUserId;
        effectiveManagerId = undefined;
    } else if (reqRole === 'manager') {
        effectiveManagerId = reqUserId;
    }

    let queryStr = `
        SELECT mm.*, m.name as managerName, t.name as tenantName 
        FROM messageManager mm
        JOIN manager m ON mm.managerId = m.managerId
        JOIN tenant t ON mm.tenantId = t.tenantId
        WHERE 1=1
    `;
    let params = [];

    if (effectiveManagerId !== undefined && effectiveManagerId !== null && effectiveManagerId !== '' && effectiveManagerId !== 'undefined') {
        const parsedMgrId = parseInt(effectiveManagerId);
        if (!isNaN(parsedMgrId)) {
            queryStr += " AND mm.managerId = ?";
            params.push(parsedMgrId);
        }
    }

    if (effectiveTenantId !== undefined && effectiveTenantId !== null && effectiveTenantId !== '' && effectiveTenantId !== 'undefined') {
        const parsedTenantId = parseInt(effectiveTenantId);
        if (!isNaN(parsedTenantId)) {
            queryStr += " AND mm.tenantId = ?";
            params.push(parsedTenantId);
        }
    } else if (reqRole === 'tenant') {
        const parsedUserId = parseInt(reqUserId);
        if (!isNaN(parsedUserId)) {
            queryStr += " AND mm.tenantId = ?";
            params.push(parsedUserId);
        } else {
            queryStr += " AND 1=0";
        }
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
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    if (managerId === undefined || tenantId === undefined || !message) {
        return res.status(400).json({ detail: "managerId, tenantId, and message are required." });
    }

    if (reqRole === 'tenant' && String(tenantId) !== String(reqUserId)) {
        return res.status(403).json({ detail: "Access denied. You cannot send messages as another tenant." });
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
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    if (!role) {
        return res.status(400).json({ detail: "role is required." });
    }

    const lowerRole = role.toLowerCase();

    try {
        const existing = await db.fetchOne("SELECT tenantId FROM messageManager WHERE messageId = ?", [messageId]);
        if (!existing) {
            return res.status(404).json({ detail: "Message not found." });
        }
        if (reqRole === 'tenant' && String(existing.tenantId) !== String(reqUserId)) {
            return res.status(403).json({ detail: "Access denied. You can only edit your own messages." });
        }

        if (lowerRole === 'tenant') {
            await db.query(
                "UPDATE messageManager SET message = ?, responseMessage = NULL WHERE messageId = ?",
                [message, messageId]
            );
        } else if (lowerRole === 'manager' || lowerRole === 'owner') {
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
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    try {
        const existing = await db.fetchOne("SELECT tenantId FROM messageManager WHERE messageId = ?", [messageId]);
        if (!existing) {
            return res.status(404).json({ detail: "Message not found." });
        }
        if (reqRole === 'tenant' && String(existing.tenantId) !== String(reqUserId)) {
            return res.status(403).json({ detail: "Access denied. You can only delete your own messages." });
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

    if ((owner_id === undefined || owner_id === null || owner_id === '' || owner_id === 'undefined') &&
        (manager_id === undefined || manager_id === null || manager_id === '' || manager_id === 'undefined')) {
        return res.status(400).json({ detail: "owner_id or manager_id is required." });
    }

    try {
        if (owner_id !== undefined && owner_id !== null && owner_id !== '' && owner_id !== 'undefined') {
            let queryStr = `
                SELECT DISTINCT 
                    mm.messageId, mm.managerId, mm.tenantId, mm.message, mm.responseMessage,
                    t.name as tenantName, 
                    m.name as managerName, 
                    a.apartmentNo, 
                    b.address as buildingAddress
                FROM messageManager mm
                JOIN tenant t ON mm.tenantId = t.tenantId
                JOIN manager m ON mm.managerId = m.managerId
                JOIN apartment a ON t.tenantId = a.tenantId
                JOIN building b ON a.buildingId = b.buildingId
                WHERE b.ownerId = ?
            `;
            const msgs = await db.query(queryStr, [parseInt(owner_id)]);
            res.json({
                status: "success",
                message: localizations.translate("success", locale),
                count: msgs.length,
                data: msgs
            });
        } else {
            let queryStr = `
                SELECT DISTINCT
                    mm.messageId, mm.managerId, mm.tenantId, mm.message, mm.responseMessage,
                    t.name as tenantName, 
                    o.name as ownerName,
                    a.apartmentNo, 
                    b.address as buildingAddress
                FROM messageManager mm
                JOIN tenant t ON mm.tenantId = t.tenantId
                JOIN apartment a ON t.tenantId = a.tenantId
                JOIN building b ON a.buildingId = b.buildingId
                JOIN owner o ON b.ownerId = o.ownerId
                WHERE b.managerId = ?
            `;
            const msgs = await db.query(queryStr, [parseInt(manager_id)]);
            res.json({
                status: "success",
                message: localizations.translate("success", locale),
                count: msgs.length,
                data: msgs
            });
        }
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
