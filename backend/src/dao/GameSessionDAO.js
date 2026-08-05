const { get, query, run } = require('../db/db');

/**
 * Data Access Object (DAO) for Game Session entity.
 * Handles database operations for game_sessions table.
 */
class GameSessionDAO {
    static async createSession(sessionObj) {
        const {
            id,
            user_id,
            mode = 'PV_AI',
            player1_name = 'Player 1',
            player2_name = 'AI Opponent',
            current_turn = 'P1',
            p1_position = 0,
            p2_position = 0,
            status = 'IN_PROGRESS',
            dice_history = '[]'
        } = sessionObj;

        const sql = `
            INSERT INTO game_sessions 
            (id, user_id, mode, player1_name, player2_name, current_turn, p1_position, p2_position, status, dice_history, is_paid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `;
        await run(sql, [
            id, user_id, mode, player1_name, player2_name, current_turn,
            p1_position, p2_position, status, typeof dice_history === 'string' ? dice_history : JSON.stringify(dice_history)
        ]);
        return await this.getSessionById(id);
    }

    static async getSessionById(id) {
        const sql = `SELECT * FROM game_sessions WHERE id = ?`;
        const session = await get(sql, [id]);
        if (session && typeof session.dice_history === 'string') {
            try {
                session.dice_history = JSON.parse(session.dice_history);
            } catch (e) {
                session.dice_history = [];
            }
        }
        return session;
    }

    static async getUserSessions(userId) {
        const sql = `SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC`;
        const sessions = await query(sql, [userId]);
        return sessions.map(session => {
            if (typeof session.dice_history === 'string') {
                try {
                    session.dice_history = JSON.parse(session.dice_history);
                } catch (e) {
                    session.dice_history = [];
                }
            }
            return session;
        });
    }

    static async updateSessionState(id, updateObj) {
        const {
            p1_position,
            p2_position,
            current_turn,
            status,
            winner,
            dice_history
        } = updateObj;

        const sql = `
            UPDATE game_sessions 
            SET p1_position = ?,
                p2_position = ?,
                current_turn = ?,
                status = ?,
                winner = ?,
                dice_history = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `;
        await run(sql, [
            p1_position,
            p2_position,
            current_turn,
            status,
            winner || null,
            typeof dice_history === 'string' ? dice_history : JSON.stringify(dice_history),
            id
        ]);
        return await this.getSessionById(id);
    }
}

module.exports = GameSessionDAO;
