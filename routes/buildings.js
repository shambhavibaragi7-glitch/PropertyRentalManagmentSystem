const express = require('express');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

// GET /api/buildings
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { manager_id, owner_id, search } = req.query;

    let queryStr = `
        SELECT b.*, COALESCE(a.totalApartments, 0) as totalApartments, m.name as managerName, o.name as ownerName
        FROM building b
        LEFT JOIN (
            SELECT buildingId, COUNT(*) as totalApartments
            FROM apartment
            GROUP BY buildingId
        ) a ON b.buildingId = a.buildingId
        LEFT JOIN manager m ON b.managerId = m.managerId
        LEFT JOIN owner o ON b.ownerId = o.ownerId
        WHERE 1=1
    `;
    let params = [];

    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
        queryStr += " AND b.managerId = ?";
        params.push(manager_id);
    }

    if (owner_id !== undefined && owner_id !== null && owner_id !== '') {
        queryStr += " AND b.ownerId = ?";
        params.push(owner_id);
    }

    if (search) {
        queryStr += " AND (b.address LIKE ? OR b.city LIKE ? OR b.province LIKE ? OR b.postalCode LIKE ?)";
        const searchWild = `%${search}%`;
        params.push(searchWild, searchWild, searchWild, searchWild);
    }

    try {
        const buildings = await db.query(queryStr, params);
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: buildings.length,
            data: buildings
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// GET /api/buildings/:id
router.get('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const buildingId = req.params.id;

    const queryStr = `
        SELECT b.*, m.name as managerName, o.name as ownerName
        FROM building b
        LEFT JOIN manager m ON b.managerId = m.managerId
        LEFT JOIN owner o ON b.ownerId = o.ownerId
        WHERE b.buildingId = ?
    `;

    try {
        const building = await db.fetchOne(queryStr, [buildingId]);
        if (!building) {
            return res.status(404).json({
                detail: localizations.translate("building_not_found", locale, { id: buildingId })
            });
        }
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            data: building
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/buildings
router.post('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { address, city, province, postalCode, ownerId, managerId } = req.body;

    if (!address || !city || !province || !postalCode || !ownerId || !managerId) {
        return res.status(400).json({ detail: "All fields are required." });
    }

    try {
        await db.query(
            "INSERT INTO building (address, city, province, postalCode, ownerId, managerId) VALUES (?, ?, ?, ?, ?, ?)",
            [address, city, province, postalCode, ownerId, managerId]
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

// PUT /api/buildings/:id
router.put('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const buildingId = req.params.id;
    const { address, city, province, postalCode, ownerId, managerId } = req.body;

    if (!address || !city || !province || !postalCode || !ownerId || !managerId) {
        return res.status(400).json({ detail: "All fields are required." });
    }

    try {
        const existing = await db.fetchOne("SELECT 1 FROM building WHERE buildingId = ?", [buildingId]);
        if (!existing) {
            return res.status(404).json({ detail: "Building not found." });
        }

        await db.query(
            "UPDATE building SET address = ?, city = ?, province = ?, postalCode = ?, ownerId = ?, managerId = ? WHERE buildingId = ?",
            [address, city, province, postalCode, ownerId, managerId, buildingId]
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

// DELETE /api/buildings/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const buildingId = req.params.id;

    try {
        const aptCount = await db.fetchOne("SELECT COUNT(*) AS total FROM apartment WHERE buildingId = ?", [buildingId]);
        if (aptCount && aptCount.total > 0) {
            return res.status(400).json({
                detail: "This building cannot be deleted because it contains apartments. Please delete or relocate the apartments first."
            });
        }

        await db.query("DELETE FROM building WHERE buildingId = ?", [buildingId]);

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
