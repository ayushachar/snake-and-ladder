import React from 'react';
import { ShieldCheck, Dices, UserCheck, LogOut, History, BookOpen, CreditCard, Sparkles } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onOpenAuth, onOpenPayment, onOpenRules, onLogout }) {
    return (
        <header className="glass-panel" style={{ borderRadius: '0 0 16px 16px', borderTop: 'none', padding: '0.85rem 2rem', margin: '0 0 1.5rem 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Brand Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('game')}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)'
                    }}>
                        <Dices size={24} color="#040914" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                            SNAKES <span style={{ color: '#00f2fe' }}>&</span> LADDERS
                        </h1>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                            Layered Architecture Engine
                        </span>
                    </div>
                </div>

                {/* Action Controls & Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

                    <button className="btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }} onClick={onOpenRules}>
                        <BookOpen size={16} color="#00f2fe" />
                        <span>Rules</span>
                    </button>

                    {user && (
                        <button
                            className={`btn-secondary ${activeTab === 'history' ? 'active' : ''}`}
                            style={{
                                padding: '0.5rem 0.9rem',
                                fontSize: '0.85rem',
                                borderColor: activeTab === 'history' ? '#00f2fe' : undefined,
                                background: activeTab === 'history' ? 'rgba(0, 242, 254, 0.15)' : undefined
                            }}
                            onClick={() => setActiveTab(activeTab === 'history' ? 'game' : 'history')}
                        >
                            <History size={16} color="#4facfe" />
                            <span>{activeTab === 'history' ? 'Play Game' : 'Game History'}</span>
                        </button>
                    )}

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.85rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                                    {user.name}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: user.has_active_pass ? '#00b09b' : '#f6d365', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    {user.has_active_pass ? <Sparkles size={10} /> : <CreditCard size={10} />}
                                    {user.has_active_pass ? 'VIP Unlimited Pass' : 'Standard Account'}
                                </span>
                            </div>

                            {!user.has_active_pass && (
                                <button className="btn-gold" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }} onClick={onOpenPayment}>
                                    <CreditCard size={14} />
                                    <span>Get VIP Pass</span>
                                </button>
                            )}

                            <button className="btn-secondary" style={{ padding: '0.45rem 0.75rem', borderRadius: '8px' }} title="Logout" onClick={onLogout}>
                                <LogOut size={16} color="#ff0844" />
                            </button>
                        </div>
                    ) : (
                        <button className="btn-primary" onClick={onOpenAuth}>
                            <UserCheck size={18} />
                            <span>Sign In / Register</span>
                        </button>
                    )}

                </div>

            </div>
        </header>
    );
}
