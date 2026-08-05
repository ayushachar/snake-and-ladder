const { GameService } = require('../../dom/GameService');

class GameController {
    static async createGame(req, res) {
        try {
            const userId = req.user.id;
            const { mode, player1_name, player2_name } = req.body;
            const session = await GameService.createGame(userId, { mode, player1_name, player2_name });
            return res.status(201).json({ session });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async playTurn(req, res) {
        try {
            const userId = req.user.id;
            const { sessionId } = req.params;
            const session = await GameService.playTurn(sessionId, userId);
            return res.status(200).json({ session });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getGameSession(req, res) {
        try {
            const userId = req.user.id;
            const { sessionId } = req.params;
            const session = await GameService.getGameSession(sessionId, userId);
            return res.status(200).json({ session });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const history = await GameService.getGameHistory(userId);
            return res.status(200).json({ history });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}

module.exports = GameController;
