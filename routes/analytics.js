const express = require('express');
const db = require('../db');
const localizations = require('../localizations');

const router = express.Router();

// GET /api/analytics/occupancy
router.get('/occupancy', async (req, res) => {
    const locale = localizations.getLocaleFromHeader(req.headers['accept-language']);

    try {
        const totalResult = await db.fetchOne("SELECT COUNT(*) AS total FROM apartment");
        const occupiedResult = await db.fetchOne("SELECT COUNT(*) AS total FROM apartment WHERE tenantId IS NOT NULL");

        const totalApts = totalResult ? totalResult.total : 0;
        const occupiedApts = occupiedResult ? occupiedResult.total : 0;
        const vacantApts = totalApts - occupiedApts;
        const occupancyRate = totalApts > 0 ? (occupiedApts / totalApts * 100.0) : 0.0;

        res.json({
            status: "success",
            message: localizations.translate("success", locale),
            report_title: localizations.translate("occupancy_rate_title", locale),
            summary: localizations.translate("summary", locale),
            metrics: [
                {
                    label: localizations.translate("total_apartments", locale),
                    value: totalApts
                },
                {
                    label: localizations.translate("occupied_apartments", locale),
                    value: occupiedApts
                },
                {
                    label: localizations.translate("vacant_apartments", locale),
                    value: vacantApts
                },
                {
                    label: localizations.translate("occupancy_rate", locale),
                    value: `${occupancyRate.toFixed(2)}%`
                }
            ]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: err.message });
    }
});

module.exports = router;
