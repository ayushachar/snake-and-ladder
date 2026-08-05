-- Migration 001: Initial Schema for Snakes & Ladders Game App
-- Compatible with PostgreSQL (and adapted for SQLite fallback)

-- Table: users
-- Stores user credentials and profile details (name, DOB, email, phone)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    has_active_pass BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user authentication lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Table: game_sessions
-- Tracks game sessions, mode (PV_AI or PV_P), player positions, turns, dice rolls, and winner status
CREATE TABLE IF NOT EXISTS game_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mode VARCHAR(10) NOT NULL DEFAULT 'PV_AI', -- PV_AI or PV_P
    player1_name VARCHAR(100) NOT NULL,
    player2_name VARCHAR(100) NOT NULL,
    current_turn VARCHAR(10) NOT NULL DEFAULT 'P1', -- P1 or P2/AI
    p1_position INT NOT NULL DEFAULT 0,
    p2_position INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED
    winner VARCHAR(50),
    dice_history TEXT DEFAULT '[]', -- JSON array of move logs
    is_paid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast retrieval of user game history
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);

-- Table: payment_transactions
-- Stores mock payment records for session passes
CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL, -- CARD, UPI, NETBANKING
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED, PENDING
    transaction_ref VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for payment audit queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON payment_transactions(user_id);
