const AuthService = require('../../dom/AuthService');

class AuthController {
    static async register(req, res) {
        try {
            const { name, dob, email, phone, password } = req.body;
            const result = await AuthService.register({ name, dob, email, phone, password });
            return res.status(201).json({
                message: 'User registered successfully!',
                ...result
            });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login({ email, password });
            return res.status(200).json({
                message: 'Login successful!',
                ...result
            });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getMe(req, res) {
        try {
            const user = await AuthService.getCurrentUser(req.user.id);
            return res.status(200).json({ user });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}

module.exports = AuthController;
