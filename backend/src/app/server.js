const express = require('express');
const cors = require('cors');
require('dotenv').config();

const AuthController = require('./controllers/AuthController');
const GameController = require('./controllers/GameController');
const PaymentController = require('./controllers/PaymentController');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Express Middlewares
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Snakes & Ladders Layered API is running smoothly 🎲' });
});

// Authentication Routes (APP Layer)
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/me', authMiddleware, AuthController.getMe);

// Game Session & Logic Routes (Protected)
app.post('/api/game/start', authMiddleware, GameController.createGame);
app.post('/api/game/roll/:sessionId', authMiddleware, GameController.playTurn);
app.get('/api/game/session/:sessionId', authMiddleware, GameController.getGameSession);
app.get('/api/game/history', authMiddleware, GameController.getHistory);

// Payment Gateway Routes (Protected)
app.post('/api/payment/checkout', authMiddleware, PaymentController.checkout);
app.get('/api/payment/history', authMiddleware, PaymentController.getHistory);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend APP Server running at http://localhost:${PORT}`);
});
