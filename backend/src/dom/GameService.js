const { v4: uuidv4 } = require('uuid');
const GameSessionDAO = require('../dao/GameSessionDAO');

/**
 * Snakes and Ladders Board Domain Model (OOP & 2D Matrix structure)
 * Row 0: Tiles 1 to 10 (Left to Right)
 * Row 1: Tiles 11 to 20 (Right to Left)
 * ... up to Row 9: Tiles 91 to 100
 */
class Board {
    constructor() {
        this.size = 100;
        this.rows = 10;
        this.cols = 10;

        // Define Snakes: Head -> Tail
        this.snakes = {
            25: 2,
            52: 29,
            70: 55,
            95: 72,
            99: 54
        };

        // Define Ladders: Bottom -> Top
        this.ladders = {
            6: 27,
            14: 70,
            21: 61,
            47: 82,
            64: 95,
            71: 92
        };

        this.matrix = this.build2DMatrix();
    }

    /**
     * Builds a 10x10 2D array representation of the 100-cell board with alternating directions.
     */
    build2DMatrix() {
        const matrix = [];
        let tileNumber = 1;

        for (let r = 0; r < 10; r++) {
            const row = [];
            for (let c = 0; c < 10; c++) {
                row.push(tileNumber++);
            }
            // Reverse direction on odd rows (boustrophedon / zig-zag order)
            if (r % 2 === 1) {
                row.reverse();
            }
            matrix.push(row);
        }
        return matrix.reverse(); // Row 0 at bottom (tiles 1..10), Row 9 at top (tiles 91..100)
    }

    /**
     * Converts a tile number (1-100) to 2D matrix coordinates [row, col].
     */
    getTileCoordinates(tile) {
        if (tile <= 0) return { r: 9, c: 0 }; // Starting position
        if (tile > 100) tile = 100;

        const zeroIndex = tile - 1;
        const rowIndex = Math.floor(zeroIndex / 10);
        let colIndex = zeroIndex % 10;

        if (rowIndex % 2 === 1) {
            colIndex = 9 - colIndex; // Realigned for zig-zag board
        }

        const matrixRow = 9 - rowIndex; // 9 is bottom row, 0 is top row
        return { r: matrixRow, c: colIndex };
    }

    /**
     * Evaluates new position given current tile & dice roll.
     * Applies ladder jumps, snake slides, and exact 100 finish rule.
     */
    evaluateMove(currentTile, diceRoll) {
        const targetTile = currentTile + diceRoll;

        // Rule: Exact Roll Required to land on tile 100
        if (targetTile > 100) {
            return {
                newTile: currentTile,
                type: 'NO_MOVE',
                message: `Rolled ${diceRoll}. Needed ${100 - currentTile} or less. Passed turn.`
            };
        }

        // Check for Ladder
        if (this.ladders[targetTile]) {
            const ladderTop = this.ladders[targetTile];
            return {
                newTile: ladderTop,
                type: 'LADDER',
                message: `Climbed Ladder from ${targetTile} to ${ladderTop}! 🚀`
            };
        }

        // Check for Snake
        if (this.snakes[targetTile]) {
            const snakeTail = this.snakes[targetTile];
            return {
                newTile: snakeTail,
                type: 'SNAKE',
                message: `Bitten by Snake at ${targetTile}! Slid down to ${snakeTail}. 🐍`
            };
        }

        // Normal Move
        return {
            newTile: targetTile,
            type: 'NORMAL',
            message: `Advanced ${diceRoll} steps to cell ${targetTile}.`
        };
    }
}

class GameService {
    static boardInstance = new Board();

    /**
     * Starts a new game session (PV_AI or PV_P).
     */
    static async createGame(userId, { mode = 'PV_AI', player1_name = 'Player 1', player2_name = 'AI Opponent' }) {
        const sessionId = uuidv4();

        const sessionObj = {
            id: sessionId,
            user_id: userId,
            mode,
            player1_name,
            player2_name: mode === 'PV_AI' ? 'AI Opponent 🤖' : (player2_name || 'Player 2'),
            current_turn: 'P1',
            p1_position: 0,
            p2_position: 0,
            status: 'IN_PROGRESS',
            dice_history: []
        };

        return await GameSessionDAO.createSession(sessionObj);
    }

    /**
     * Executes a dice roll turn for the active player.
     */
    static async playTurn(sessionId, userId) {
        const session = await GameSessionDAO.getSessionById(sessionId);
        if (!session) {
            throw new Error('Game session not found.');
        }

        if (session.user_id !== userId) {
            throw new Error('Unauthorized to play this game session.');
        }

        if (session.status === 'COMPLETED') {
            throw new Error('This game session has already ended.');
        }

        const isP1Turn = session.current_turn === 'P1';
        const activePlayerName = isP1Turn ? session.player1_name : session.player2_name;
        const currentPos = isP1Turn ? session.p1_position : session.p2_position;

        // Roll 6-sided dice
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const moveResult = this.boardInstance.evaluateMove(currentPos, diceRoll);

        let newP1Pos = session.p1_position;
        let newP2Pos = session.p2_position;

        if (isP1Turn) {
            newP1Pos = moveResult.newTile;
        } else {
            newP2Pos = moveResult.newTile;
        }

        // Rule: Rolling a 6 grants an EXTRA TURN!
        const getsExtraTurn = diceRoll === 6;

        let nextTurn = session.current_turn;
        if (!getsExtraTurn) {
            nextTurn = isP1Turn ? 'P2' : 'P1';
        }

        // Check Win Condition
        let winner = null;
        let status = 'IN_PROGRESS';

        if (newP1Pos === 100) {
            winner = session.player1_name;
            status = 'COMPLETED';
        } else if (newP2Pos === 100) {
            winner = session.player2_name;
            status = 'COMPLETED';
        }

        const moveLogEntry = {
            player: activePlayerName,
            turn: session.current_turn,
            dice: diceRoll,
            from: currentPos,
            to: isP1Turn ? newP1Pos : newP2Pos,
            event: moveResult.type,
            message: moveResult.message + (getsExtraTurn ? ' 🎲 Rolled a 6! Gets an extra turn!' : ''),
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [...(session.dice_history || []), moveLogEntry];

        let updatedSession = await GameSessionDAO.updateSessionState(sessionId, {
            p1_position: newP1Pos,
            p2_position: newP2Pos,
            current_turn: nextTurn,
            status,
            winner,
            dice_history: updatedHistory
        });

        // If Mode is PV_AI and next turn is AI, automatically trigger AI's turn!
        if (updatedSession.status === 'IN_PROGRESS' && updatedSession.mode === 'PV_AI' && updatedSession.current_turn === 'P2') {
            updatedSession = await this.executeAITurn(updatedSession);
        }

        return updatedSession;
    }

    /**
     * Executes AI turn logic automatically.
     */
    static async executeAITurn(session) {
        const currentPos = session.p2_position;
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        const moveResult = this.boardInstance.evaluateMove(currentPos, diceRoll);

        const newP2Pos = moveResult.newTile;
        const getsExtraTurn = diceRoll === 6;
        const nextTurn = getsExtraTurn ? 'P2' : 'P1';

        let winner = null;
        let status = 'IN_PROGRESS';

        if (newP2Pos === 100) {
            winner = session.player2_name;
            status = 'COMPLETED';
        }

        const moveLogEntry = {
            player: session.player2_name,
            turn: 'P2',
            dice: diceRoll,
            from: currentPos,
            to: newP2Pos,
            event: moveResult.type,
            message: `🤖 AI: ` + moveResult.message + (getsExtraTurn ? ' 🎲 AI rolled 6! Extra turn!' : ''),
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [...(session.dice_history || []), moveLogEntry];

        let updatedSession = await GameSessionDAO.updateSessionState(session.id, {
            p1_position: session.p1_position,
            p2_position: newP2Pos,
            current_turn: nextTurn,
            status,
            winner,
            dice_history: updatedHistory
        });

        // If AI gets an extra turn (rolled 6) and game not completed, recursive call for extra turn
        if (getsExtraTurn && updatedSession.status === 'IN_PROGRESS') {
            updatedSession = await this.executeAITurn(updatedSession);
        }

        return updatedSession;
    }

    static async getGameHistory(userId) {
        return await GameSessionDAO.getUserSessions(userId);
    }

    static async getGameSession(sessionId, userId) {
        const session = await GameSessionDAO.getSessionById(sessionId);
        if (!session) throw new Error('Game session not found.');
        if (session.user_id !== userId) throw new Error('Unauthorized.');
        return session;
    }
}

module.exports = {
    Board,
    GameService
};
