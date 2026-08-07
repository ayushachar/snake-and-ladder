import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, ArrowUpRight, Flame } from 'lucide-react';

// --- CONSTANTS & HELPERS ---
const STAGE_WIDTH = 10;
const STAGE_HEIGHT = 20;

const createStage = () =>
    Array.from(Array(STAGE_HEIGHT), () => new Array(STAGE_WIDTH).fill([0, 'clear']));

const TETROMINOS = {
    0: { shape: [[0]], color: 'var(--bg-panel)' }, // Empty
    I: {
        shape: [
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0],
            [0, 'I', 0, 0]
        ],
        color: '0, 242, 254'
    },
    J: {
        shape: [
            [0, 'J', 0],
            [0, 'J', 0],
            ['J', 'J', 0]
        ],
        color: '59, 130, 246'
    },
    L: {
        shape: [
            [0, 'L', 0],
            [0, 'L', 0],
            [0, 'L', 'L']
        ],
        color: '245, 158, 11'
    },
    O: {
        shape: [
            ['O', 'O'],
            ['O', 'O']
        ],
        color: '252, 211, 77'
    },
    S: {
        shape: [
            [0, 'S', 'S'],
            ['S', 'S', 0],
            [0, 0, 0]
        ],
        color: '16, 185, 129'
    },
    T: {
        shape: [
            [0, 0, 0],
            ['T', 'T', 'T'],
            [0, 'T', 0]
        ],
        color: '139, 92, 246'
    },
    Z: {
        shape: [
            ['Z', 'Z', 0],
            [0, 'Z', 'Z'],
            [0, 0, 0]
        ],
        color: '239, 68, 68'
    }
};

const randomTetromino = () => {
    const tetrominos = 'IJLOSTZ';
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return TETROMINOS[randTetromino];
};

const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
            // 1. Check that we're on an actual Tetromino cell
            if (player.tetromino[y][x] !== 0) {
                if (
                    // 2. Check that our move is inside the game areas height (y)
                    // We shouldn't go through the bottom of the play area
                    !stage[y + player.pos.y + moveY] ||
                    // 3. Check that our move is inside the game areas width (x)
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    // 4. Check that the cell we're moving to isn't set to clear
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};

// --- CUSTOM HOOKS ---

// usePlayer Hook
const usePlayer = () => {
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    const rotate = (matrix, dir) => {
        // Transpose rows to cols
        const rotatedTetro = matrix.map((_, index) => matrix.map((col) => col[index]));
        // Reverse each row to get a rotated matrix
        if (dir > 0) return rotatedTetro.map((row) => row.reverse());
        return rotatedTetro.reverse();
    };

    const playerRotate = (stage, dir) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        // Wall kick logic
        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            // Bail if we offset too much (meaning we can't rotate)
            if (offset > clonedPlayer.tetromino[0].length) {
                rotate(clonedPlayer.tetromino, -dir); // rotate back
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer((prev) => ({
            ...prev,
            pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
            collided,
        }));
    };

    const resetPlayer = useCallback(() => {
        setPlayer({
            pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        });
    }, []);

    return [player, updatePlayerPos, resetPlayer, playerRotate];
};

// useBoard Hook
const useBoard = (player, resetPlayer) => {
    const [stage, setStage] = useState(createStage());
    const [rowsCleared, setRowsCleared] = useState(0);

    useEffect(() => {
        setRowsCleared(0);
        const sweepRows = (newStage) =>
            newStage.reduce((ack, row) => {
                // If a row doesn't contain a 'clear' cell (i.e. empty cell), clear it
                if (row.findIndex((cell) => cell[1] === 'clear') === -1) {
                    setRowsCleared((prev) => prev + 1);
                    // create a new empty row and push it to the top
                    ack.unshift(new Array(STAGE_WIDTH).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);

        const updateStage = (prevStage) => {
            // First flush the stage
            // If it's a 'clear' cell, keep it clear (0). If not, we keep what's there (merged)
            const newStage = prevStage.map((row) =>
                row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            // Then draw the active tetromino
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newStage[y + player.pos.y][x + player.pos.x] = [
                            value,
                            `${player.collided ? 'merged' : 'clear'}`,
                        ];
                    }
                });
            });

            // Check if we collided, then reset player
            if (player.collided) {
                resetPlayer();
                return sweepRows(newStage);
            }
            return newStage;
        };

        // Here we pass a function inside setStage so it can grab prevStage 
        setStage((prev) => updateStage(prev));
    }, [
        player.collided,
        player.pos.x,
        player.pos.y,
        player.tetromino,
        resetPlayer
    ]);

    return [stage, setStage, rowsCleared];
};


// --- MAIN GAMe COMPONENT ---

export default function TetrisBoard() {
    const [dropTime, setDropTime] = useState(null);
    const [gameOver, setGameOver] = useState(false);

    const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
    const [stage, setStage, rowsCleared] = useBoard(player, resetPlayer);
    
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(0);

    const gameAreaRef = useRef();

    // Scoring logic
    const calcScore = useCallback(() => {
        const linePoints = [40, 100, 300, 1200];
        if (rowsCleared > 0) {
            setScore((prev) => prev + linePoints[rowsCleared - 1] * (level + 1));
            setRows((prev) => prev + rowsCleared);
        }
    }, [level, rowsCleared]);

    useEffect(() => {
        calcScore();
    }, [calcScore, rowsCleared, score]);

    const movePlayer = (dir) => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0 });
        }
    };

    const startGame = () => {
        // Reset everything
        setStage(createStage());
        setDropTime(1000);
        resetPlayer();
        setGameOver(false);
        setScore(0);
        setRows(0);
        setLevel(0);
        gameAreaRef.current?.focus();
    };

    const drop = () => {
        // Increase level when player has cleared 10 rows
        if (rows > (level + 1) * 10) {
            setLevel((prev) => prev + 1);
            // Also increase speed
            setDropTime(1000 / (level + 1) + 200);
        }

        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            // Game Over
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
            }
            updatePlayerPos({ x: 0, y: 0, collided: true });
        }
    };

    const keyUp = ({ keyCode }) => {
        if (!gameOver) {
            // Reactivate drop when down arrow is released
            if (keyCode === 40) {
                setDropTime(1000 / (level + 1) + 200);
            }
        }
    };

    const dropPlayer = () => {
        setDropTime(null); // Stop drop animation while user forces drop
        drop();
    };

    // Controller
    const move = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) { // Left arrow
                movePlayer(-1);
            } else if (keyCode === 39) { // Right arrow
                movePlayer(1);
            } else if (keyCode === 40) { // Down arrow
                dropPlayer();
            } else if (keyCode === 38) { // Up arrow
                playerRotate(stage, 1);
            }
        }
    };

    // Main Game Loop for dropping
    const useInterval = (callback, delay) => {
        const savedCallback = useRef();
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                const id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [delay]);
    };

    useInterval(() => {
        drop();
    }, dropTime);

    return (
        <div 
            style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 3rem 1rem', display: 'flex', flexDirection: 'column' }}
        >
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Interactive Tetris</span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            10x20 Grid Engine
                        </span>
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Use arrow keys to move and rotate the falling blocks!
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button className="btn-primary" onClick={startGame} title={gameOver ? 'Restart Game' : 'Start Game'}>
                        {gameOver || !dropTime ? <Play size={18} /> : <RotateCcw size={16} />}
                        <span>{gameOver ? 'Play Again' : (dropTime ? 'Restart Game' : 'Start Game')}</span>
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto 300px', gap: '2rem', justifyContent: 'center' }}>
                {/* Game Stage Area */}
                <div 
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => move(e)}
                    onKeyUp={keyUp}
                    ref={gameAreaRef}
                    style={{
                        position: 'relative',
                        outline: 'none',
                        width: 'min-content'
                    }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateRows: `repeat(${STAGE_HEIGHT}, calc(25vw / ${STAGE_WIDTH}))`,
                        gridTemplateColumns: `repeat(${STAGE_WIDTH}, calc(25vw / ${STAGE_WIDTH}))`,
                        gap: '1px',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        background: '#040914',
                        backgroundSize: 'cover',
                        padding: '2px',
                        borderRadius: '0.5rem',
                        boxShadow: '0 0 40px rgba(0, 0, 0, 0.3)'
                    }}>
                        {stage.map(row => row.map((cell, x) => (
                            <div key={x} style={{
                                width: 'auto',
                                background: cell[0] === 0 ? 'rgba(0, 0, 0, 0.3)' : `rgba(${TETROMINOS[cell[0]].color}, 0.8)`,
                                border: cell[0] === 0 ? '0px solid' : '4px solid',
                                borderBottomColor: `rgba(${TETROMINOS[cell[0]].color}, 0.1)`,
                                borderRightColor: `rgba(${TETROMINOS[cell[0]].color}, 1)`,
                                borderTopColor: `rgba(${TETROMINOS[cell[0]].color}, 1)`,
                                borderLeftColor: `rgba(${TETROMINOS[cell[0]].color}, 0.3)`,
                                borderRadius: '4px'
                            }} />
                        )))}
                    </div>

                    {/* Game Over Overlay */}
                    {gameOver && (
                        <div style={{
                            position: 'absolute',
                            top: 0, bottom: 0, left: 0, right: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.5rem',
                            color: '#ff0844'
                        }}>
                           <Flame size={48} style={{ marginBottom: '1rem' }} />
                           <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>GAME OVER</h2>
                           <p style={{ color: '#f8fafc', marginTop: '0.5rem' }}>Score: {score}</p>
                        </div>
                    )}
                </div>

                {/* Score Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Score</span>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f6d365', marginTop: '0.2rem' }}>
                                {score}
                            </div>
                        </div>
                        
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Lines Cleared</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00f2fe', marginTop: '0.2rem' }}>
                                {rows}
                            </div>
                        </div>

                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>Level</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                                {level}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Controls
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Move Left / Right</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>← / →</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Soft Drop</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>↓</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Rotate</span>
                                <span style={{ color: '#fff', fontWeight: 600 }}>↑</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
