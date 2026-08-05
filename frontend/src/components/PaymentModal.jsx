import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess }) {
    const [method, setMethod] = useState('CARD');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePay = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.processCheckout({
                amount: 5.00,
                currency: 'USD',
                payment_method: method
            });
            setSuccess(true);
            setTimeout(() => {
                onPaymentSuccess();
                onClose();
                setSuccess(false);
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                {success ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <CheckCircle2 size={54} color="#00b09b" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Payment Authorized!</h3>
                        <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Your VIP Unlimited Pass is now active on your account. Enjoy premium board access!
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(246, 211, 101, 0.15)',
                                border: '1px solid var(--accent-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem auto'
                            }}>
                                <Sparkles size={24} color="#f6d365" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                                VIP Game Pass Checkout
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                Unlock unlimited multiplayer sessions & leaderboards
                            </p>
                        </div>

                        {/* Pricing Tag */}
                        <div style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.25rem'
                        }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Plan</span>
                                <h4 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>Unlimited Match Entitlement</h4>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f6d365' }}>$5.00</span>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>One-time payment</span>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: 'rgba(255, 8, 68, 0.15)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', color: '#ff4d6d', fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        {/* Payment Method Selector */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label">Select Payment Gateway</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                {[
                                    { id: 'CARD', label: 'Credit Card' },
                                    { id: 'UPI', label: 'UPI / QR' },
                                    { id: 'NETBANKING', label: 'NetBanking' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setMethod(item.id)}
                                        style={{
                                            padding: '0.65rem 0.5rem',
                                            borderRadius: '8px',
                                            border: method === item.id ? '1px solid #f6d365' : '1px solid var(--border-color)',
                                            background: method === item.id ? 'rgba(246, 211, 101, 0.12)' : 'rgba(255,255,255,0.03)',
                                            color: method === item.id ? '#f6d365' : '#94a3b8',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mock Gateway Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="form-label">{method === 'UPI' ? 'UPI Virtual ID' : 'Card Number / Account Ref'}</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={method === 'UPI' ? 'player@upi' : '4242 •••• •••• 4242'}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <button className="btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePay} disabled={loading}>
                            <CreditCard size={18} />
                            <span>{loading ? 'Authorizing Payment...' : 'Pay $5.00 & Activate Pass'}</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: '#64748b', fontSize: '0.75rem' }}>
                            <ShieldCheck size={14} />
                            <span>256-Bit Encrypted Secure Gateway Simulation</span>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}
