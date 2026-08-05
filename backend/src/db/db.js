const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database schema from migration SQL
db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    // Read migration script
    const migrationPath = path.resolve(__dirname, '../../../migrations/001_init_schema.sql');
    if (fs.existsSync(migrationPath)) {
        let migrationSql = fs.readFileSync(migrationPath, 'utf8');
        // Adapt PG syntax for SQLite execution
        migrationSql = migrationSql
            .replace(/VARCHAR\(\d+\)/gi, 'TEXT')
            .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/gi, 'TEXT DEFAULT (datetime(\'now\'))')
            .replace(/BOOLEAN DEFAULT FALSE/gi, 'INTEGER DEFAULT 0')
            .replace(/BOOLEAN DEFAULT TRUE/gi, 'INTEGER DEFAULT 1')
            .replace(/DECIMAL\(\d+,\s*\d+\)/gi, 'REAL')
            .replace(/DATE NOT NULL/gi, 'TEXT NOT NULL');

        const statements = migrationSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        statements.forEach(stmt => {
            db.run(stmt, (err) => {
                if (err && !err.message.includes('already exists')) {
                    console.error('Migration statement error:', err.message);
                }
            });
        });
        console.log('✅ SQLite Database initialized with PostgreSQL migration schema.');
    }
});

// Promise-based wrapper helpers for DB operations
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

module.exports = {
    db,
    query,
    get,
    run
};
