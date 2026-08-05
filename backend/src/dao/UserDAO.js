const { get, query, run } = require('../db/db');

/**
 * Data Access Object (DAO) for User entity.
 * Handles database operations for User table.
 */
class UserDAO {
    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        return await get(sql, [email.toLowerCase().trim()]);
    }

    static async findById(id) {
        const sql = `SELECT id, name, dob, email, phone, has_active_pass, created_at FROM users WHERE id = ?`;
        return await get(sql, [id]);
    }

    static async create(userObj) {
        const { id, name, dob, email, phone, password_hash } = userObj;
        const sql = `
            INSERT INTO users (id, name, dob, email, phone, password_hash, has_active_pass)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;
        await run(sql, [id, name, dob, email.toLowerCase().trim(), phone, password_hash]);
        return await this.findById(id);
    }

    static async updateActivePass(id, hasActivePass) {
        const sql = `UPDATE users SET has_active_pass = ? WHERE id = ?`;
        await run(sql, [hasActivePass ? 1 : 0, id]);
        return await this.findById(id);
    }
}

module.exports = UserDAO;
