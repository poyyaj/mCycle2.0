const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/logs — list daily logs
router.get('/', authenticate, async (req, res) => {
    try {
        const { month, year } = req.query;
        let result;
        if (month && year) {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
            const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
            const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
            result = await pool.query(
                'SELECT * FROM daily_logs WHERE user_id = $1 AND log_date >= $2 AND log_date < $3 ORDER BY log_date DESC',
                [req.user.id, startDate, endDate]
            );
        } else {
            result = await pool.query(
                'SELECT * FROM daily_logs WHERE user_id = $1 ORDER BY log_date DESC LIMIT 90',
                [req.user.id]
            );
        }
        res.json({ logs: result.rows });
    } catch (err) {
        console.error('Get logs error:', err);
        res.status(500).json({ error: 'Failed to fetch daily logs.' });
    }
});

// POST /api/logs — create a daily log
router.post('/', authenticate, async (req, res) => {
    try {
        const { log_date, mood, acne_level, hair_growth_level, pain_level, medication, exercise_minutes, exercise_type, notes } = req.body;
        if (!log_date) {
            return res.status(400).json({ error: 'log_date is required.' });
        }

        const insertResult = await pool.query(
            `INSERT INTO daily_logs (user_id, log_date, mood, acne_level, hair_growth_level, pain_level, medication, exercise_minutes, exercise_type, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [req.user.id, log_date, mood || null, acne_level ?? null, hair_growth_level ?? null, pain_level ?? null, medication || null, exercise_minutes ?? null, exercise_type || null, notes || null]
        );

        const logResult = await pool.query('SELECT * FROM daily_logs WHERE id = $1', [insertResult.rows[0].id]);
        res.status(201).json({ log: logResult.rows[0] });
    } catch (err) {
        console.error('Create log error:', err);
        res.status(500).json({ error: 'Failed to create daily log.' });
    }
});

// PUT /api/logs/:id — update a daily log
router.put('/:id', authenticate, async (req, res) => {
    try {
        const existingResult = await pool.query(
            'SELECT * FROM daily_logs WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        const existing = existingResult.rows[0];
        if (!existing) return res.status(404).json({ error: 'Log not found.' });

        const { mood, acne_level, hair_growth_level, pain_level, medication, exercise_minutes, exercise_type, notes } = req.body;

        await pool.query(
            `UPDATE daily_logs SET mood=$1, acne_level=$2, hair_growth_level=$3, pain_level=$4, medication=$5, exercise_minutes=$6, exercise_type=$7, notes=$8 WHERE id=$9`,
            [
                mood !== undefined ? mood : existing.mood,
                acne_level !== undefined ? acne_level : existing.acne_level,
                hair_growth_level !== undefined ? hair_growth_level : existing.hair_growth_level,
                pain_level !== undefined ? pain_level : existing.pain_level,
                medication !== undefined ? medication : existing.medication,
                exercise_minutes !== undefined ? exercise_minutes : existing.exercise_minutes,
                exercise_type !== undefined ? exercise_type : existing.exercise_type,
                notes !== undefined ? notes : existing.notes,
                req.params.id
            ]
        );

        const updatedResult = await pool.query('SELECT * FROM daily_logs WHERE id = $1', [req.params.id]);
        res.json({ log: updatedResult.rows[0] });
    } catch (err) {
        console.error('Update log error:', err);
        res.status(500).json({ error: 'Failed to update daily log.' });
    }
});

module.exports = router;
