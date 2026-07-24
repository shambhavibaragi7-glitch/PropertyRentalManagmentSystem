const express = require('express');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

function formatDatetime(dt) {
    if (!dt) return "";
    const d = new Date(dt);
    if (isNaN(d.getTime())) return dt;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// GET /api/events
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { manager_id, owner_id } = req.query;

    let queryStr = `
        SELECT e.eventId, e.managerId, e.ownerId, e.apartmentId, e.eventDate, e.description, e.status,
               m.name as managerName, o.name as ownerName, a.apartmentNo,
               e.reply
        FROM eventOwner e
        JOIN manager m ON e.managerId = m.managerId
        JOIN owner o ON e.ownerId = o.ownerId
        JOIN apartment a ON e.apartmentId = a.apartmentId
        WHERE 1=1
    `;
    let params = [];

    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
        queryStr += " AND e.managerId = ?";
        params.push(parseInt(manager_id));
    }

    if (owner_id !== undefined && owner_id !== null && owner_id !== '') {
        queryStr += " AND e.ownerId = ?";
        params.push(parseInt(owner_id));
    }

    try {
        const events = await db.query(queryStr, params);
        events.forEach(ev => {
            if (ev.eventDate) {
                ev.eventDate = formatDatetime(ev.eventDate);
            }
        });
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: events.length,
            data: events
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const eventId = req.params.id;

    const queryStr = `
        SELECT e.eventId, e.managerId, e.ownerId, e.apartmentId, e.eventDate, e.description, e.status,
               m.name as managerName, o.name as ownerName, a.apartmentNo,
               e.reply
        FROM eventOwner e
        JOIN manager m ON e.managerId = m.managerId
        JOIN owner o ON e.ownerId = o.ownerId
        JOIN apartment a ON e.apartmentId = a.apartmentId
        WHERE e.eventId = ?
    `;

    try {
        const event = await db.fetchOne(queryStr, [eventId]);
        if (!event) {
            return res.status(404).json({ detail: "Event not found." });
        }
        if (event.eventDate) {
            event.eventDate = formatDatetime(event.eventDate);
        }
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            data: event
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/events
router.post('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { managerId, ownerId, apartmentId, description } = req.body;

    if (managerId === undefined || ownerId === undefined || apartmentId === undefined || !description) {
        return res.status(400).json({ detail: "managerId, ownerId, apartmentId, and description are required." });
    }

    // Format current timestamp: YYYY-MM-DD HH:mm:ss
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        await db.query(
            "INSERT INTO eventOwner (managerId, ownerId, apartmentId, eventDate, description, status) VALUES (?, ?, ?, ?, ?, 'Pending')",
            [managerId, ownerId, apartmentId, nowStr, description]
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

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const eventId = req.params.id;
    const { role, description, status, reply } = req.body;

    if (!role) {
        return res.status(400).json({ detail: "role is required." });
    }

    const lowerRole = role.toLowerCase();

    try {
        const existing = await db.fetchOne("SELECT managerId, ownerId, description, status, reply FROM eventOwner WHERE eventId = ?", [eventId]);
        if (!existing) {
            return res.status(404).json({ detail: "Event not found." });
        }

        if (lowerRole === 'owner') {
            await db.query(
                "UPDATE eventOwner SET status = ?, reply = ? WHERE eventId = ?",
                [status || existing.status, reply !== undefined ? reply : existing.reply, eventId]
            );
        } else if (lowerRole === 'manager') {
            await db.query(
                "UPDATE eventOwner SET description = ? WHERE eventId = ?",
                [description || existing.description, eventId]
            );
        } else {
            return res.status(400).json({ detail: "Invalid role for event modification." });
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

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const eventId = req.params.id;

    try {
        const existing = await db.fetchOne("SELECT 1 FROM eventOwner WHERE eventId = ?", [eventId]);
        if (!existing) {
            return res.status(404).json({ detail: "Event not found." });
        }

        await db.query("DELETE FROM eventOwner WHERE eventId = ?", [eventId]);
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
