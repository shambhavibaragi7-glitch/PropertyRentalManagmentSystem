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

// GET /api/appointments
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { manager_id, tenant_id } = req.query;

    let queryStr = `
        SELECT a.*, m.name as managerName, t.name as tenantName, t.email as tenantEmail, t.phoneNumber as tenantPhone 
        FROM appointment a
        JOIN manager m ON a.managerId = m.managerId
        JOIN tenant t ON a.tenantId = t.tenantId
        WHERE 1=1
    `;
    let params = [];

    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
        queryStr += " AND a.managerId = ?";
        params.push(parseInt(manager_id));
    }

    if (tenant_id !== undefined && tenant_id !== null && tenant_id !== '') {
        queryStr += " AND a.tenantId = ?";
        params.push(parseInt(tenant_id));
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

    if (managerId === undefined || tenantId === undefined || !appointmentDate || !description) {
        return res.status(400).json({ detail: "managerId, tenantId, appointmentDate, and description are required." });
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
            "INSERT INTO appointment (managerId, tenantId, appointmentDate, description) VALUES (?, ?, ?, ?)",
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
    const { managerId, tenantId, appointmentDate, description } = req.body;

    if (managerId === undefined || tenantId === undefined || !appointmentDate || !description) {
        return res.status(400).json({ detail: "managerId, tenantId, appointmentDate, and description are required." });
    }

    const d = new Date(appointmentDate);
    if (isNaN(d.getTime())) {
        return res.status(400).json({ detail: "Invalid date format. Use YYYY-MM-DDTHH:MM" });
    }
    const formattedDate = d.toISOString().slice(0, 19).replace('T', ' ');

    try {
        const existing = await db.fetchOne("SELECT 1 FROM appointment WHERE appointmentId = ?", [appointmentId]);
        if (!existing) {
            return res.status(404).json({ detail: "Appointment not found." });
        }

        await db.query(
            "UPDATE appointment SET managerId = ?, tenantId = ?, appointmentDate = ?, description = ? WHERE appointmentId = ?",
            [managerId, tenantId, formattedDate, description, appointmentId]
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

// DELETE /api/appointments/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const appointmentId = req.params.id;

    try {
        const existing = await db.fetchOne("SELECT 1 FROM appointment WHERE appointmentId = ?", [appointmentId]);
        if (!existing) {
            return res.status(404).json({ detail: "Appointment not found." });
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
