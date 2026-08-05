const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    // Auth API
    register: async (userData) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    login: async (credentials) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    getMe: async () => {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
        return data.user;
    },

    // Game API
    startGame: async (gameConfig) => {
        const res = await fetch(`${API_BASE_URL}/game/start`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(gameConfig)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start game');
        return data.session;
    },

    playTurn: async (sessionId) => {
        const res = await fetch(`${API_BASE_URL}/game/roll/${sessionId}`, {
            method: 'POST',
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to execute dice roll turn');
        return data.session;
    },

    getGameSession: async (sessionId) => {
        const res = await fetch(`${API_BASE_URL}/game/session/${sessionId}`, {
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch session');
        return data.session;
    },

    getGameHistory: async () => {
        const res = await fetch(`${API_BASE_URL}/game/history`, {
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
        return data.history;
    },

    // Payment API
    processCheckout: async (paymentDetails) => {
        const res = await fetch(`${API_BASE_URL}/payment/checkout`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(paymentDetails)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment processing failed');
        return data;
    }
};
