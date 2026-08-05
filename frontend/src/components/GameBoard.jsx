import React, { useState, useEffect, useRef } from 'react';
import { Dices, Bot, Users, Trophy, Play, RotateCcw, Volume2, VolumeX, Sparkles, ArrowUpRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

// Sound Synthesizer using Web Audio API
const playAudioSound = (type, soundEnabled = true) => {
    if (!soundEnabled) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'DICE') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'LADDER') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
            osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.3); // C5
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'SNAKE') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.35);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } else if (type === 'WIN') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        }
    } catch (e) {
        // Audio Context fail silent
    }
};

const LADDERS = { 6: 27, 14: 70, 21: 61, 47: 82, 64: 95, 71: 92 };
const SNAKES = { 25: 2, 52: 29, 70: 55, 95: 72, 99: 54 };

export default function GameBoard({ user, onRequireAuth, onRequirePayment }) {
    const [mode, setMode] = useState('PV_AI'); // PV_AI or PV_P
    const [player2NameInput, setPlayer2NameInput] = useState('Player 2');
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rolling, setRolling] = useState(false);
    const [lastDice, setLastDice] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const moveLogEndRef = useRef(null);

    useEffect(() => {
        moveLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session?.dice_history]);

    // Construct 10x10 Matrix cells (1..100) with zig-zag mapping
    const renderBoardGrid = () => {
        const gridRows = [];
        for (let r = 9; r >= 0; r--) {
            const rowCells = [];
            for (let c = 0; c < 10; c++) {
                let tileNum;
                if (r % 2 === 0) {
                    tileNum = r * 10 + c + 1; // Left to Right
                } else {
                    tileNum = r * 10 + (9 - c) + 1; // Right to Left
                }

                const isLadderFoot = LADDERS[tileNum];
                const isSnakeHead = SNAKES[tileNum];
                const isP1Here = session && session.p1_position === tileNum;
                const isP2Here = session && session.p2_position === tileNum;
                const isFinish = tileNum === 100;

                let cellClass = 'board-cell ';
                if (isFinish) cellClass += 'cell-finish ';
                else if (isLadderFoot) cellClass += 'cell-ladder ';
                else if (isSnakeHead) cellClass += 'cell-snake ';
                else cellClass += tileNum % 2 === 0 ? 'cell-even ' : 'cell-odd ';

                rowCells.push(
                    <div key={tileNum} className={cellClass} title={`Cell ${tileNum}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{tileNum}</span>
                            {isLadderFoot && <span style={{ fontSize: '0.6rem', color: '#00b09b', fontWeight: 800 }}>🪜 {isLadderFoot}</span>}
                            {isSnakeHead && <span style={{ fontSize: '0.6rem', color: '#ff0844', fontWeight: 800 }}>🐍 {isSnakeHead}</span>}
                            {isFinish && <span style={{ fontSize: '0.7rem' }}>🏆 100</span>}
                        </div>

                        {/* Tokens Container */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: 'auto' }}>
                            {isP1Here && (
                                <div className="player-token-p1" title={session.player1_name}>
                                    P1
                                </div>
                            )}
                            {isP2Here && (
                                <div className="player-token-p2" title={session.player2_name}>
                                    {mode === 'PV_AI' ? '🤖' : 'P2'}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            gridRows.push(rowCells);
        }
        return gridRows;
    };

    const handleStartGame = async () => {
        if (!user) {
            onRequireAuth();
            return;
        }

        setLoading(true);
        try {
            const newSession = await api.startGame({
                mode,
                player1_name: user.name,
                player2_name: mode === 'PV_P' ? player2NameInput : 'AI Opponent'
            });
            setSession(newSession);
            setLastDice(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRollDice = async () => {
        if (!session || session.status === 'COMPLETED' || rolling) return;

        setRolling(true);
        playAudioSound('DICE', soundEnabled);

        try {
            const updatedSession = await api.playTurn(session.id);

            setTimeout(() => {
                setSession(updatedSession);
                setRolling(false);

                const history = updatedSession.dice_history || [];
                const lastMove = history[history.length - 1];
                if (lastMove) {
                    setLastDice(lastMove.dice);

                    if (lastMove.event === 'LADDER') playAudioSound('LADDER', soundEnabled);
                    else if (lastMove.event === 'SNAKE') playAudioSound('SNAKE', soundEnabled);
                }

                if (updatedSession.status === 'COMPLETED') {
                    playAudioSound('WIN', soundEnabled);
                    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                }
            }, 400);

        } catch (err) {
            setRolling(false);
            alert(err.message);
        }
    };

    const isMyTurn = session && session.status === 'IN_PROGRESS';
    const activeTurnName = session ? (session.current_turn === 'P1' ? session.player1_name : session.player2_name) : '';

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>

            {/* Top Banner & Mode Control */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Interactive Game Board</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(0, 242, 254, 0.3)' }}>
                            10x10 Matrix Engine
                        </span>
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Roll the die, climb ladders, dodge snakes, and claim victory at tile 100!
                    </p>
                </div>

                {/* Mode Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        className="btn-secondary"
                        style={{
                            background: mode === 'PV_AI' ? 'rgba(0, 242, 254, 0.18)' : undefined,
                            borderColor: mode === 'PV_AI' ? '#00f2fe' : undefined
                        }}
                        onClick={() => setMode('PV_AI')}
                        disabled={session && session.status === 'IN_PROGRESS'}
                    >
                        <Bot size={18} color="#00f2fe" />
                        <span>Player vs AI</span>
                    </button>

                    <button
                        className="btn-secondary"
                        style={{
                            background: mode === 'PV_P' ? 'rgba(246, 211, 101, 0.18)' : undefined,
                            borderColor: mode === 'PV_P' ? '#f6d365' : undefined
                        }}
                        onClick={() => setMode('PV_P')}
                        disabled={session && session.status === 'IN_PROGRESS'}
                    >
                        <Users size={18} color="#f6d365" />
                        <span>Player vs Player</span>
                    </button>

                    <button
                        className="btn-secondary"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
                        style={{ padding: '0.6rem' }}
                    >
                        {soundEnabled ? <Volume2 size={18} color="#00b09b" /> : <VolumeX size={18} color="#ff0844" />}
                    </button>

                    {!session || session.status === 'COMPLETED' ? (
                        <button className="btn-primary" onClick={handleStartGame} disabled={loading}>
                            <Play size={18} />
                            <span>{loading ? 'Starting...' : 'New Game Session'}</span>
                        </button>
                    ) : (
                        <button className="btn-secondary" onClick={handleStartGame} title="Restart">
                            <RotateCcw size={16} />
                            <span>New Match</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Game Interface Split (Board Left, Controls & Log Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.9fr)', gap: '1.5rem' }}>

                {/* Left Column: 10x10 Visual Board */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Start Tile 0 Status */}
                    <div style={{ width: '100%', maxWidth: '580px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Start Position: Tile 0</span>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                            <span style={{ color: '#00f2fe', fontWeight: 700 }}>P1: Tile {session ? session.p1_position : 0}</span>
                            <span style={{ color: '#f6d365', fontWeight: 700 }}>P2: Tile {session ? session.p2_position : 0}</span>
                        </div>
                    </div>

                    <div className="board-grid">
                        {renderBoardGrid()}
                    </div>
                </div>

                {/* Right Column: Interactive Dice Roller, Turn Logger & Session Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Active Turn Card */}
                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>

                        {session?.status === 'COMPLETED' ? (
                            <div style={{ padding: '0.5rem' }}>
                                <Trophy size={48} color="#f6d365" style={{ margin: '0 auto 0.75rem auto' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                                    🎉 {session.winner} Wins!
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                    Reached cell 100! Click 'New Match' to play again.
                                </p>
                            </div>
                        ) : session ? (
                            <>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
                                    Current Active Turn
                                </span>

                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: session.current_turn === 'P1' ? '#00f2fe' : '#f6d365', margin: '0.3rem 0 1rem 0' }}>
                                    {activeTurnName}'s Turn
                                </h3>

                                {/* Interactive Dice Button */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

                                    <button
                                        onClick={handleRollDice}
                                        disabled={rolling || !isMyTurn}
                                        className="btn-primary"
                                        style={{
                                            padding: '1.1rem 2.5rem',
                                            fontSize: '1.1rem',
                                            borderRadius: '16px',
                                            transform: rolling ? 'scale(0.95) rotate(15deg)' : undefined,
                                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }}
                                    >
                                        <Dices size={28} className={rolling ? 'animate-spin' : ''} />
                                        <span>{rolling ? 'Rolling Die...' : 'Roll Dice 🎲'}</span>
                                    </button>

                                    {lastDice && (
                                        <div style={{
                                            fontSize: '1.8rem',
                                            fontWeight: 800,
                                            color: '#f8fafc',
                                            background: 'rgba(255,255,255,0.06)',
                                            padding: '0.4rem 1.2rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <span>Rolled:</span>
                                            <span style={{ color: '#00f2fe' }}>{lastDice}</span>
                                        </div>
                                    )}

                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '1rem' }}>
                                <Dices size={42} color="#00f2fe" style={{ margin: '0 auto 0.75rem auto' }} />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>No Active Session</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                                    Select game mode (Player vs AI or Player vs Player) and click <strong>New Game Session</strong> to start!
                                </p>
                            </div>
                        )}

                    </div>

                    {/* Move History Logger */}
                    <div className="glass-panel" style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column', maxHeight: '380px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Live Match Turn Logger
                        </h4>

                        <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {session?.dice_history && session.dice_history.length > 0 ? (
                                session.dice_history.map((log, index) => (
                                    <div key={index} style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        borderLeft: log.event === 'LADDER' ? '3px solid #00b09b' : (log.event === 'SNAKE' ? '3px solid #ff0844' : '3px solid #4facfe'),
                                        borderRadius: '6px',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.8rem'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>
                                            <span>{log.player}</span>
                                            <span>Rolled 🎲 {log.dice}</span>
                                        </div>
                                        <div style={{ color: '#f8fafc', marginTop: '0.15rem' }}>
                                            {log.message}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
                                    Match event log will appear here as moves are played.
                                </div>
                            )}
                            <div ref={moveLogEndRef} />
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
