const { get, query, run } = require('../db/db');

/**
 * Data Access Object (DAO) for Payment Transactions entity.
 */
class TransactionDAO {
    static async createTransaction(txObj) {
        const {
            id,
            user_id,
            amount,
            currency = 'USD',
            payment_method,
            status = 'SUCCESS',
            transaction_ref
        } = txObj;

        const sql = `
            INSERT INTO payment_transactions 
            (id, user_id, amount, currency, payment_method, status, transaction_ref)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await run(sql, [id, user_id, amount, currency, payment_method, status, transaction_ref]);
        return await this.getTransactionById(id);
    }

    static async getTransactionById(id) {
        const sql = `SELECT * FROM payment_transactions WHERE id = ?`;
        return await get(sql, [id]);
    }

    static async getUserTransactions(userId) {
        const sql = `SELECT * FROM payment_transactions WHERE user_id = ? ORDER BY created_at DESC`;
        return await query(sql, [userId]);
    }
}

module.exports = TransactionDAO;
