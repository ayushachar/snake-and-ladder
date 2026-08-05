import React from 'react';
import { X, BookOpen, Rocket, Zap, Award, ArrowUpRight, Flame } from 'lucide-react';

export default function RulesModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(0, 242, 254, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BookOpen size={22} color="#00f2fe" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                            Official Snakes & Ladders Rules
                        </h2>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Game Mechanics & Win Conditions</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Rule 1 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                        <Rocket size={24} color="#00f2fe" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.2rem' }}>1. The Board & Goal</h4>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                The board is a 100-cell grid (1 to 100). Both players start at position 0 off the board. Roll the 6-sided die to advance your player token. First player to reach cell 100 wins!
                            </p>
                        </div>
                    </div>

                    {/* Rule 2 */}
                    <div style={{ background: 'rgba(0, 176, 155, 0.08)', border: '1px dashed rgba(0, 176, 155, 0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                        <ArrowUpRight size={24} color="#00b09b" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00b09b', marginBottom: '0.2rem' }}>2. Ladders (Boost Upward) 🚀</h4>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                If you land exactly on the foot of a ladder (e.g. 6, 14, 21, 47, 64, 71), you automatically climb to the top of the ladder!
                            </p>
                        </div>
                    </div>

                    {/* Rule 3 */}
                    <div style={{ background: 'rgba(255, 8, 68, 0.08)', border: '1px dashed rgba(255, 8, 68, 0.4)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                        <Flame size={24} color="#ff0844" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ff0844', marginBottom: '0.2rem' }}>3. Snakes (Slide Backward) 🐍</h4>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                Landing on the head of a snake (e.g. 25, 52, 70, 95, 99) bites your token, sliding you down to its tail position.
                            </p>
                        </div>
                    </div>

                    {/* Rule 4 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                        <Zap size={24} color="#f6d365" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f6d365', marginBottom: '0.2rem' }}>4. Extra Turn on Rolling a 6 🎲</h4>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                Whenever you roll a 6, your token advances 6 steps AND you earn an immediate extra dice roll turn!
                            </p>
                        </div>
                    </div>

                    {/* Rule 5 */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.85rem' }}>
                        <Award size={24} color="#4facfe" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4facfe', marginBottom: '0.2rem' }}>5. Exact Roll Finish Rule</h4>
                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                To win, you must land EXACTLY on cell 100. If your roll exceeds cell 100, your token stays put and turn passes.
                            </p>
                        </div>
                    </div>

                </div>

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }} onClick={onClose}>
                    Got it! Ready to Play
                </button>

            </div>
        </div>
    );
}
