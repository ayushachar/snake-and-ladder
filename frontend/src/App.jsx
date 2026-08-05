import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import RulesModal from './components/RulesModal';
import GameBoard from './components/GameBoard';
import HistoryDashboard from './components/HistoryDashboard';
import { api } from './services/api';

export default function App() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('game'); // 'game' or 'history'
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);

    useEffect(() => {
        checkCurrentUser();
    }, []);

    const checkCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userProfile = await api.getMe();
                setUser(userProfile);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setActiveTab('game');
    };

    const handlePaymentSuccess = async () => {
        await checkCurrentUser();
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <Navbar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenAuth={() => setIsAuthOpen(true)}
                onOpenPayment={() => setIsPaymentOpen(true)}
                onOpenRules={() => setIsRulesOpen(true)}
                onLogout={handleLogout}
            />

            <main style={{ flexGrow: 1 }}>
                {activeTab === 'history' && user ? (
                    <HistoryDashboard user={user} />
                ) : (
                    <GameBoard
                        user={user}
                        onRequireAuth={() => setIsAuthOpen(true)}
                        onRequirePayment={() => setIsPaymentOpen(true)}
                    />
                )}
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: 'auto' }}>
                <span>Snakes & Ladders Layered Application (APP, DOM, DAO) • Built with React & Node.js</span>
            </footer>

            {/* Modals */}
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onAuthSuccess={(userData) => setUser(userData)}
            />

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />

            <RulesModal
                isOpen={isRulesOpen}
                onClose={() => setIsRulesOpen(false)}
            />

        </div>
    );
}
