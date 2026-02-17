const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/cycles — list all cycles for the user
router.get('/', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cycles WHERE user_id = $1 ORDER BY start_date DESC',
            [req.user.id]
        );
        res.json({ cycles: result.rows });
    } catch (err) {
        console.error('Get cycles error:', err);
        res.status(500).json({ error: 'Failed to fetch cycles.' });
    }
});

// POST /api/cycles — log a new cycle
router.post('/', authenticate, async (req, res) => {
    try {
        const { start_date, end_date, notes } = req.body;
        if (!start_date) {
            return res.status(400).json({ error: 'start_date is required.' });
        }

        // Calculate bleeding duration
        let bleeding_duration = null;
        if (end_date) {
            const diff = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24);
            bleeding_duration = Math.round(diff) + 1; // inclusive
        }

        // Calculate cycle length from previous cycle
        let cycle_length = null;
        const prevResult = await pool.query(
            'SELECT start_date FROM cycles WHERE user_id = $1 AND start_date < $2 ORDER BY start_date DESC LIMIT 1',
            [req.user.id, start_date]
        );
        if (prevResult.rows.length > 0) {
            const diff = (new Date(start_date) - new Date(prevResult.rows[0].start_date)) / (1000 * 60 * 60 * 24);
            cycle_length = Math.round(diff);
        }

        // Predict next cycle date (average of last 6 cycle lengths)
        let predicted_next = null;
        const recentResult = await pool.query(
            'SELECT cycle_length FROM cycles WHERE user_id = $1 AND cycle_length IS NOT NULL ORDER BY start_date DESC LIMIT 6',
            [req.user.id]
        );

        let avgLength = 28; // default
        if (recentResult.rows.length > 0) {
            avgLength = Math.round(recentResult.rows.reduce((s, c) => s + c.cycle_length, 0) / recentResult.rows.length);
        } else if (cycle_length) {
            avgLength = cycle_length;
        }
        const nextDate = new Date(start_date);
        nextDate.setDate(nextDate.getDate() + avgLength);
        predicted_next = nextDate.toISOString().split('T')[0];

        const insertResult = await pool.query(
            `INSERT INTO cycles (user_id, start_date, end_date, cycle_length, bleeding_duration, predicted_next, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [req.user.id, start_date, end_date || null, cycle_length, bleeding_duration, predicted_next, notes || null]
        );

        const cycleResult = await pool.query('SELECT * FROM cycles WHERE id = $1', [insertResult.rows[0].id]);
        res.status(201).json({ cycle: cycleResult.rows[0] });
    } catch (err) {
        console.error('Create cycle error:', err);
        res.status(500).json({ error: 'Failed to create cycle.' });
    }
});

// PUT /api/cycles/:id — update a cycle
router.put('/:id', authenticate, async (req, res) => {
    try {
        const cycleResult = await pool.query(
            'SELECT * FROM cycles WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        const cycle = cycleResult.rows[0];
        if (!cycle) return res.status(404).json({ error: 'Cycle not found.' });

        const { start_date, end_date, notes } = req.body;
        const sd = start_date || cycle.start_date;
        const ed = end_date !== undefined ? end_date : cycle.end_date;

        let bleeding_duration = cycle.bleeding_duration;
        if (ed) {
            bleeding_duration = Math.round((new Date(ed) - new Date(sd)) / (1000 * 60 * 60 * 24)) + 1;
        }

        await pool.query(
            'UPDATE cycles SET start_date = $1, end_date = $2, bleeding_duration = $3, notes = $4 WHERE id = $5',
            [sd, ed, bleeding_duration, notes !== undefined ? notes : cycle.notes, req.params.id]
        );

        const updatedResult = await pool.query('SELECT * FROM cycles WHERE id = $1', [req.params.id]);
        res.json({ cycle: updatedResult.rows[0] });
    } catch (err) {
        console.error('Update cycle error:', err);
        res.status(500).json({ error: 'Failed to update cycle.' });
    }
});

// DELETE /api/cycles/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const cycleResult = await pool.query(
            'SELECT * FROM cycles WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (cycleResult.rows.length === 0) return res.status(404).json({ error: 'Cycle not found.' });

        await pool.query('DELETE FROM cycles WHERE id = $1', [req.params.id]);
        res.json({ message: 'Cycle deleted.' });
    } catch (err) {
        console.error('Delete cycle error:', err);
        res.status(500).json({ error: 'Failed to delete cycle.' });
    }
});

module.exports = router;
