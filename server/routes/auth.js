const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, date_of_birth } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, date_of_birth) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, password_hash, date_of_birth || null]
        );
        const userId = result.rows[0].id;

        const token = jwt.sign(
            { id: userId, email, name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ token, user: { id: userId, name, email } });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error during signup.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, date_of_birth, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
