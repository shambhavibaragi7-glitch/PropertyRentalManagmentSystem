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
    return `${year}-${month}-${day}`;
}

// GET /api/appointments
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { manager_id, tenant_id } = req.query;
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    let effectiveTenantId = tenant_id;
    let effectiveManagerId = manager_id;
    if (reqRole === 'tenant') {
        effectiveTenantId = reqUserId;
        effectiveManagerId = undefined;
    }

    let queryStr = `
        SELECT a.*, m.name as managerName, t.name as tenantName, t.email as tenantEmail, t.phoneNumber as tenantPhone 
        FROM appointment a
        JOIN manager m ON a.managerId = m.managerId
        JOIN tenant t ON a.tenantId = t.tenantId
        WHERE 1=1
    `;
    let params = [];

    if (effectiveManagerId !== undefined && effectiveManagerId !== null && effectiveManagerId !== '') {
        queryStr += " AND a.managerId = ?";
        params.push(parseInt(effectiveManagerId));
    }

    if (effectiveTenantId !== undefined && effectiveTenantId !== null && effectiveTenantId !== '') {
        queryStr += " AND a.tenantId = ?";
        params.push(parseInt(effectiveTenantId));
    } else if (reqRole === 'tenant') {
        queryStr += " AND a.tenantId = ?";
        params.push(parseInt(reqUserId));
    }

    try {
        const appts = await db.query(queryStr, params);
        appts.forEach(appt => {
            if (appt.appointmentDate) {
                appt.appointmentDate = formatDatetime(appt.appointmentDate);
            }
        });
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: appts.length,
            data: appts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// GET /api/appointments/:id
router.get('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const appointmentId = req.params.id;
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    const queryStr = `
        SELECT a.*, m.name as managerName, t.name as tenantName, t.email as tenantEmail, t.phoneNumber as tenantPhone 
        FROM appointment a
        JOIN manager m ON a.managerId = m.managerId
        JOIN tenant t ON a.tenantId = t.tenantId
        WHERE a.appointmentId = ?
    `;

    try {
        const appt = await db.fetchOne(queryStr, [appointmentId]);
        if (!appt) {
            return res.status(404).json({ detail: "Appointment not found." });
        }
        if (reqRole === 'tenant' && String(appt.tenantId) !== String(reqUserId)) {
            return res.status(403).json({ detail: "Access denied. You can only access your own appointments." });
        }
        if (appt.appointmentDate) {
            appt.appointmentDate = formatDatetime(appt.appointmentDate);
        }
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            data: appt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/appointments
router.post('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { managerId, tenantId, appointmentDate, description } = req.body;
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    if (managerId === undefined || tenantId === undefined || !appointmentDate || !description) {
        return res.status(400).json({ detail: "managerId, tenantId, appointmentDate, and description are required." });
    }

    if (reqRole === 'tenant' && String(tenantId) !== String(reqUserId)) {
        return res.status(403).json({ detail: "Access denied. You cannot book appointments for other tenants." });
    }

    // Parse date
    const d = new Date(appointmentDate);
    if (isNaN(d.getTime())) {
        return res.status(400).json({ detail: "Invalid date format. Use YYYY-MM-DDTHH:MM" });
    }

    // Format for SQL Server DATETIME: YYYY-MM-DD HH:mm:ss
    const formattedDate = d.toISOString().slice(0, 19).replace('T', ' ');

    try {
        await db.query(
            "INSERT INTO appointment (managerId, tenantId, appointmentDate, description, status) VALUES (?, ?, ?, ?, 'pending')",
            [managerId, tenantId, formattedDate, description]
        );

        // Send a notification message from the tenant to the manager
        const rawDesc = description || '';
        const shortDesc = rawDesc.length > 40 ? rawDesc.substring(0, 37) + '...' : rawDesc;
        const notificationMsg = localizations.translate("appointment_booked_notification", locale, {
            date: formattedDate,
            desc: shortDesc
        }).substring(0, 100);

        await db.query(
            "INSERT INTO messageManager (managerId, tenantId, message, responseMessage) VALUES (?, ?, ?, NULL)",
            [managerId, tenantId, notificationMsg]
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

// PUT /api/appointments/:id
router.put('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const appointmentId = req.params.id;
    const { managerId, tenantId, appointmentDate, description, status } = req.body;
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    if (managerId === undefined || tenantId === undefined || !appointmentDate || !description) {
        return res.status(400).json({ detail: "managerId, tenantId, appointmentDate, and description are required." });
    }

    if (reqRole === 'tenant' && String(tenantId) !== String(reqUserId)) {
        return res.status(403).json({ detail: "Access denied. You cannot reschedule appointments for other tenants." });
    }

    const d = new Date(appointmentDate);
    if (isNaN(d.getTime())) {
        return res.status(400).json({ detail: "Invalid date format. Use YYYY-MM-DDTHH:MM" });
    }
    const formattedDate = d.toISOString().slice(0, 19).replace('T', ' ');

    try {
        const existing = await db.fetchOne("SELECT tenantId, status FROM appointment WHERE appointmentId = ?", [appointmentId]);
        if (!existing) {
            return res.status(404).json({ detail: "Appointment not found." });
        }
        if (reqRole === 'tenant' && String(existing.tenantId) !== String(reqUserId)) {
            return res.status(403).json({ detail: "Access denied. You can only update your own appointments." });
        }

        const statusVal = status !== undefined ? status : existing.status;
        await db.query(
            "UPDATE appointment SET managerId = ?, tenantId = ?, appointmentDate = ?, description = ?, status = ? WHERE appointmentId = ?",
            [managerId, tenantId, formattedDate, description, statusVal, appointmentId]
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

// PATCH /api/appointments/:id/status
router.patch('/:id/status', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;
    const reqRole = req.headers['x-user-role'];

    if (!status) {
        return res.status(400).json({ detail: "Status is required." });
    }

    if (reqRole === 'tenant') {
        return res.status(403).json({ detail: "Access denied. Tenants cannot update appointment status." });
    }

    try {
        const existing = await db.fetchOne("SELECT appointmentId FROM appointment WHERE appointmentId = ?", [appointmentId]);
        if (!existing) {
            return res.status(404).json({ detail: "Appointment not found." });
        }

        await db.query("UPDATE appointment SET status = ? WHERE appointmentId = ?", [status, appointmentId]);

        res.json({
            status: "success",
            message: localizations.translate("success", locale)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const appointmentId = req.params.id;
    const reqRole = req.headers['x-user-role'];
    const reqUserId = req.headers['x-user-id'];

    try {
        const existing = await db.fetchOne("SELECT tenantId FROM appointment WHERE appointmentId = ?", [appointmentId]);
        if (!existing) {
            return res.status(404).json({ detail: "Appointment not found." });
        }
        if (reqRole === 'tenant' && String(existing.tenantId) !== String(reqUserId)) {
            return res.status(403).json({ detail: "Access denied. You can only cancel your own appointments." });
        }

        await db.query("DELETE FROM appointment WHERE appointmentId = ?", [appointmentId]);

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
