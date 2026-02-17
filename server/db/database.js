const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('');
    console.error('══════════════════════════════════════════════════════════');
    console.error('  ❌ DATABASE_URL environment variable is NOT SET!');
    console.error('');
    console.error('  On Render, you need to:');
    console.error('  1. Create a PostgreSQL database (New+ → PostgreSQL)');
    console.error('  2. Copy its "Internal Database URL"');
    console.error('  3. Add it as DATABASE_URL in your Web Service → Environment');
    console.error('══════════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDb() {
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('✅ Database schema initialized');
}

module.exports = { pool, initDb };
