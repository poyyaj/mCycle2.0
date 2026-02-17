const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/metrics — list all health metrics
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM health_metrics WHERE user_id = $1 ORDER BY recorded_date DESC',
            [req.user.id]
        );
        res.json({ metrics: result.rows });
    } catch (err) {
        console.error('Get metrics error:', err);
        res.status(500).json({ error: 'Failed to fetch health metrics.' });
    }
});

// POST /api/metrics — log health metrics
router.post('/', authenticate, async (req, res) => {
    try {
        const { recorded_date, weight_kg, height_cm, waist_cm, hip_cm, wrist_cm } = req.body;
        if (!recorded_date) {
            return res.status(400).json({ error: 'recorded_date is required.' });
        }

        // Auto-calculate BMI and waist-hip ratio
        let bmi = null;
        if (weight_kg && height_cm) {
            const heightM = height_cm / 100;
            bmi = Math.round((weight_kg / (heightM * heightM)) * 10) / 10;
        }

        let waist_hip_ratio = null;
        if (waist_cm && hip_cm) {
            waist_hip_ratio = Math.round((waist_cm / hip_cm) * 100) / 100;
        }

        const insertResult = await pool.query(
            `INSERT INTO health_metrics (user_id, recorded_date, weight_kg, height_cm, waist_cm, hip_cm, wrist_cm, bmi, waist_hip_ratio)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [req.user.id, recorded_date, weight_kg || null, height_cm || null, waist_cm || null, hip_cm || null, wrist_cm || null, bmi, waist_hip_ratio]
        );

        const metricResult = await pool.query('SELECT * FROM health_metrics WHERE id = $1', [insertResult.rows[0].id]);
        res.status(201).json({ metric: metricResult.rows[0] });
    } catch (err) {
        console.error('Create metric error:', err);
        res.status(500).json({ error: 'Failed to log health metrics.' });
    }
});

module.exports = router;
