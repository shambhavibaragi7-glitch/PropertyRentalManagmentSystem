const express = require('express');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

// GET /api/apartments
router.get('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { status, min_price, max_price, manager_id, tenant_id, owner_id, search } = req.query;

    let queryStr = `
        SELECT a.apartmentId, a.apartmentNo, a.nbRooms, a.price, a.status, a.buildingId, a.tenantId, a.subtype,
               b.address as buildingAddress, b.city as buildingCity, b.province as buildingProvince, 
               b.postalCode as buildingPostalCode, b.managerId, b.ownerId, b.latitude, b.longitude, 
               t.name as tenantName,
               a.description, a.image
        FROM apartment a
        JOIN building b ON a.buildingId = b.buildingId
        LEFT JOIN tenant t ON a.tenantId = t.tenantId
        WHERE 1=1
    `;
    let params = [];

    if (status) {
        queryStr += " AND a.status = ?";
        params.push(status);
    }

    if (min_price !== undefined && min_price !== null && min_price !== '') {
        queryStr += " AND a.price >= ?";
        params.push(parseFloat(min_price));
    }

    if (max_price !== undefined && max_price !== null && max_price !== '') {
        queryStr += " AND a.price <= ?";
        params.push(parseFloat(max_price));
    }

    if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
        queryStr += " AND b.managerId = ?";
        params.push(parseInt(manager_id));
    }

    if (owner_id !== undefined && owner_id !== null && owner_id !== '') {
        queryStr += " AND b.ownerId = ?";
        params.push(parseInt(owner_id));
    }

    if (tenant_id !== undefined && tenant_id !== null && tenant_id !== '') {
        queryStr += " AND (a.status = 'Available' OR a.tenantId = ?)";
        params.push(parseInt(tenant_id));
    }

    if (search) {
        const bhkMatch = search.match(/(\d+)\s*bhk/i);
        const roomMatch = search.match(/(\d+)\s*room/i);
        const studioMatch = /studio/i.test(search);
        
        let targetRooms = null;
        if (bhkMatch) {
            targetRooms = parseInt(bhkMatch[1]);
        } else if (roomMatch) {
            targetRooms = parseInt(roomMatch[1]);
        }

        queryStr += ` AND (
            CAST(a.apartmentNo AS VARCHAR(50)) LIKE ? OR
            b.address LIKE ? OR
            b.city LIKE ? OR
            b.province LIKE ? OR
            b.postalCode LIKE ? OR
            CAST(a.nbRooms AS VARCHAR(50)) LIKE ? OR
            CAST(a.price AS VARCHAR(50)) LIKE ? OR
            a.status LIKE ?
            ${targetRooms !== null ? "OR a.nbRooms = ?" : ""}
            ${studioMatch ? "OR a.nbRooms = 0" : ""}
        )`;
        const searchWild = `%${search}%`;
        params.push(searchWild, searchWild, searchWild, searchWild, searchWild, searchWild, searchWild, searchWild);
        if (targetRooms !== null) {
            params.push(targetRooms);
        }
    }

    try {
        const apartments = await db.query(queryStr, params);
        // Normalize price as floats (some drivers return them as strings or numbers)
        apartments.forEach(apt => {
            if (apt.price !== undefined && apt.price !== null) {
                apt.price = parseFloat(apt.price);
            }
        });
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            count: apartments.length,
            data: apartments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// GET /api/apartments/:id
router.get('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const apartmentId = req.params.id;

    const queryStr = `
        SELECT a.apartmentId, a.apartmentNo, a.nbRooms, a.price, a.status, a.buildingId, a.tenantId, a.subtype,
               b.address as buildingAddress, b.city as buildingCity, b.province as buildingProvince, 
               b.postalCode as buildingPostalCode, b.managerId, b.ownerId, b.latitude, b.longitude, 
               t.name as tenantName, o.name as ownerName, o.email as ownerEmail, o.phoneNumber as ownerPhone,
               a.description, a.image
        FROM apartment a
        JOIN building b ON a.buildingId = b.buildingId
        LEFT JOIN tenant t ON a.tenantId = t.tenantId
        LEFT JOIN owner o ON b.ownerId = o.ownerId
        WHERE a.apartmentId = ?
    `;

    try {
        const apartment = await db.fetchOne(queryStr, [apartmentId]);
        if (!apartment) {
            return res.status(404).json({
                detail: localizations.translate("apartment_not_found", locale, { id: apartmentId })
            });
        }
        if (apartment.price !== undefined && apartment.price !== null) {
            apartment.price = parseFloat(apartment.price);
        }
        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            data: apartment
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

// POST /api/apartments
router.post('/', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const { apartmentNo, nbRooms, price, status, buildingId, tenantId, image, description, subtype } = req.body;

    if (apartmentNo === undefined || nbRooms === undefined || price === undefined || !status || buildingId === undefined) {
        return res.status(400).json({ detail: "apartmentNo, nbRooms, price, status, and buildingId are required." });
    }

    try {
        await db.query(
            "INSERT INTO apartment (apartmentNo, nbRooms, price, status, buildingId, tenantId, image, description, subtype) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [apartmentNo, nbRooms, price, status, buildingId, tenantId || null, image || null, description || null, subtype || null]
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

// PUT /api/apartments/:id
router.put('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const apartmentId = req.params.id;
    const { apartmentNo, nbRooms, price, status, buildingId, tenantId, image, description, subtype } = req.body;

    if (apartmentNo === undefined || nbRooms === undefined || price === undefined || !status || buildingId === undefined) {
        return res.status(400).json({ detail: "apartmentNo, nbRooms, price, status, and buildingId are required." });
    }

    try {
        const existing = await db.fetchOne("SELECT 1 FROM apartment WHERE apartmentId = ?", [apartmentId]);
        if (!existing) {
            return res.status(404).json({ detail: "Apartment not found." });
        }

        await db.query(
            "UPDATE apartment SET apartmentNo = ?, nbRooms = ?, price = ?, status = ?, buildingId = ?, tenantId = ?, image = ?, description = ?, subtype = ? WHERE apartmentId = ?",
            [apartmentNo, nbRooms, price, status, buildingId, tenantId || null, image || null, description || null, subtype || null, apartmentId]
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

// DELETE /api/apartments/:id
router.delete('/:id', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);
    const apartmentId = req.params.id;

    try {
        const eventCount = await db.fetchOne("SELECT COUNT(*) AS total FROM eventOwner WHERE apartmentId = ?", [apartmentId]);
        if (eventCount && eventCount.total > 0) {
            return res.status(400).json({
                detail: "This apartment cannot be deleted because there are related events in the system. Please delete related events first."
            });
        }

        await db.query("DELETE FROM apartment WHERE apartmentId = ?", [apartmentId]);

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
