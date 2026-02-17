require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');

const authRoutes = require('./routes/auth');
const cyclesRoutes = require('./routes/cycles');
const metricsRoutes = require('./routes/metrics');
const logsRoutes = require('./routes/logs');
const insightsRoutes = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS — allow configured origins or localhost in dev
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cycles', cyclesRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/insights', insightsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', env: NODE_ENV, timestamp: new Date().toISOString() });
});

// --- Production: serve React build ---
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Catch-all: serve index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Initialize DB schema then start server
initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🌸 mCycle server running on http://localhost:${PORT} [${NODE_ENV}]`);
    });
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});
