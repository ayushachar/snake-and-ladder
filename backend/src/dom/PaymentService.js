const { v4: uuidv4 } = require('uuid');
const TransactionDAO = require('../dao/TransactionDAO');
const UserDAO = require('../dao/UserDAO');

class PaymentService {
    /**
     * Processes a mock payment transaction and activates user game pass.
     */
    static async processCheckout(userId, { amount = 5.00, currency = 'USD', payment_method = 'CARD' }) {
        const txId = uuidv4();
        const refNumber = 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);

        const transaction = await TransactionDAO.createTransaction({
            id: txId,
            user_id: userId,
            amount: parseFloat(amount),
            currency,
            payment_method,
            status: 'SUCCESS',
            transaction_ref: refNumber
        });

        // Grant active game pass to user
        await UserDAO.updateActivePass(userId, true);

        return {
            success: true,
            message: 'Payment processed successfully! Unlimited Game Pass activated.',
            transaction
        };
    }

    static async getPaymentHistory(userId) {
        return await TransactionDAO.getUserTransactions(userId);
    }
}

module.exports = PaymentService;
