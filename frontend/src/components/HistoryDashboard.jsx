import React, { useEffect, useState } from 'react';
import { History, Trophy, Calendar, Hash, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

export default function HistoryDashboard({ user }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await api.getGameHistory();
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <History color="#00f2fe" size={24} />
                        <span>Previous Games History</span>
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Secured Audit Log of past played game sessions stored in database
                    </p>
                </div>

                <div style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.25)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total Played Matches</span>
                    <h3 style={{ fontSize: '1.2rem', color: '#00f2fe', fontWeight: 800 }}>{history.length}</h3>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading game history...</div>
            ) : history.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Clock size={40} color="#64748b" style={{ margin: '0 auto 0.75rem auto' }} />
                    <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>No previous game sessions found</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        Start a new game session on the board to build your match history!
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {history.map((session) => (
                        <div key={session.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: session.status === 'COMPLETED' ? 'rgba(0, 176, 155, 0.15)' : 'rgba(246, 211, 101, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Trophy size={22} color={session.status === 'COMPLETED' ? '#00b09b' : '#f6d365'} />
                                </div>

                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                                        {session.player1_name} <span style={{ color: '#00f2fe' }}>VS</span> {session.player2_name}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={12} />
                                            {new Date(session.created_at).toLocaleDateString()}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Hash size={12} />
                                            Mode: {session.mode === 'PV_AI' ? 'Player vs AI' : '2-Player Local'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Final Positions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Final Positions</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                                        P1: Tile {session.p1_position} | P2: Tile {session.p2_position}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: '20px',
                                        background: session.status === 'COMPLETED' ? 'rgba(0, 176, 155, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                        color: session.status === 'COMPLETED' ? '#00b09b' : '#94a3b8',
                                        border: session.status === 'COMPLETED' ? '1px solid rgba(0, 176, 155, 0.4)' : '1px solid var(--border-color)'
                                    }}>
                                        {session.status === 'COMPLETED' ? `Winner: ${session.winner}` : 'In Progress'}
                                    </span>
                                </div>

                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
