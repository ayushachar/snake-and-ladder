import React, { useState } from 'react';
import { X, UserPlus, LogIn, Mail, Lock, User, Calendar, Phone, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        email: '',
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                const res = await api.register(formData);
                localStorage.setItem('token', res.token);
                onAuthSuccess(res.user);
            } else {
                const res = await api.login({ email: formData.email, password: formData.password });
                localStorage.setItem('token', res.token);
                onAuthSuccess(res.user);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', position: 'relative' }} onClick={(e) => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {isRegister ? 'Enter user details (Name, DOB, Email, Phone)' : 'Sign in to access games & player profile'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 8, 68, 0.15)',
                        border: '1px solid rgba(255, 8, 68, 0.4)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        color: '#ff4d6d',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {isRegister && (
                        <>
                            <div>
                                <label className="form-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="John Doe"
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Date of Birth (DOB)</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={16} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="date"
                                        name="dob"
                                        required
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        placeholder="+1 (555) 019-2834"
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="user@example.com"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} color="#64748b" style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                className="form-input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                        <span>{loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Sign In')}</span>
                    </button>

                </form>

                <div style={{ textAlign: 'center', marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <button
                        type="button"
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{ background: 'none', border: 'none', color: '#00f2fe', fontWeight: 700, marginLeft: '0.4rem', cursor: 'pointer' }}
                    >
                        {isRegister ? 'Sign In' : 'Register Now'}
                    </button>
                </div>

            </div>
        </div>
    );
}
