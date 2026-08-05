const PaymentService = require('../../dom/PaymentService');

class PaymentController {
    static async checkout(req, res) {
        try {
            const userId = req.user.id;
            const { amount, currency, payment_method } = req.body;
            const result = await PaymentService.processCheckout(userId, { amount, currency, payment_method });
            return res.status(200).json(result);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    static async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const transactions = await PaymentService.getPaymentHistory(userId);
            return res.status(200).json({ transactions });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}

module.exports = PaymentController;
