'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const CELL = 16;
const COLS = 19;
const ROWS = 21;
const W = COLS * CELL;
const H = ROWS * CELL;

// 0=empty, 1=wall, 2=dot, 3=power pellet
const MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

type Dir = 'up' | 'down' | 'left' | 'right';

interface Ghost {
  x: number;
  y: number;
  color: string;
  dir: Dir;
  scared: boolean;
}

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const gameState = useRef({
    pacman: { x: 9, y: 15, dir: 'right' as Dir, nextDir: 'right' as Dir, mouthOpen: true },
    ghosts: [
      { x: 9, y: 9, color: '#FF0000', dir: 'up' as Dir, scared: false },
      { x: 8, y: 9, color: '#FFB8FF', dir: 'up' as Dir, scared: false },
      { x: 10, y: 9, color: '#00FFFF', dir: 'up' as Dir, scared: false },
      { x: 9, y: 8, color: '#FFB852', dir: 'left' as Dir, scared: false },
    ] as Ghost[],
    map: MAP.map(row => [...row]),
    score: 0,
    powerTimer: 0,
    frameCount: 0,
    running: false,
  });

  const canMove = useCallback((x: number, y: number, dir: Dir, map: number[][]) => {
    let nx = x, ny = y;
    if (dir === 'up') ny--;
    if (dir === 'down') ny++;
    if (dir === 'left') nx--;
    if (dir === 'right') nx++;
    // wrap
    if (nx < 0) nx = COLS - 1;
    if (nx >= COLS) nx = 0;
    if (ny < 0 || ny >= ROWS) return false;
    return map[ny][nx] !== 1;
  }, []);

  const move = useCallback((x: number, y: number, dir: Dir) => {
    let nx = x, ny = y;
    if (dir === 'up') ny--;
    if (dir === 'down') ny++;
    if (dir === 'left') nx--;
    if (dir === 'right') nx++;
    if (nx < 0) nx = COLS - 1;
    if (nx >= COLS) nx = 0;
    return { x: nx, y: ny };
  }, []);

  const resetGame = useCallback(() => {
    const gs = gameState.current;
    gs.pacman = { x: 9, y: 15, dir: 'right', nextDir: 'right', mouthOpen: true };
    gs.ghosts = [
      { x: 9, y: 9, color: '#FF0000', dir: 'up', scared: false },
      { x: 8, y: 9, color: '#FFB8FF', dir: 'up', scared: false },
      { x: 10, y: 9, color: '#00FFFF', dir: 'up', scared: false },
      { x: 9, y: 8, color: '#FFB852', dir: 'left', scared: false },
    ];
    gs.map = MAP.map(row => [...row]);
    gs.score = 0;
    gs.powerTimer = 0;
    gs.frameCount = 0;
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const handleKey = (e: KeyboardEvent) => {
      const gs = gameState.current;
      if (e.key === 'ArrowUp' || e.key === 'w') { gs.pacman.nextDir = 'up'; e.preventDefault(); }
      if (e.key === 'ArrowDown' || e.key === 's') { gs.pacman.nextDir = 'down'; e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'a') { gs.pacman.nextDir = 'left'; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd') { gs.pacman.nextDir = 'right'; e.preventDefault(); }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gs = gameState.current;
    gs.running = true;

    const dirs: Dir[] = ['up', 'down', 'left', 'right'];

    const interval = setInterval(() => {
      if (!gs.running) return;

      gs.frameCount++;
      const moveTick = gs.frameCount % 8 === 0;
      const ghostTick = gs.frameCount % 10 === 0;

      if (moveTick) {
        const pac = gs.pacman;
        pac.mouthOpen = !pac.mouthOpen;

        // try next direction first
        if (canMove(pac.x, pac.y, pac.nextDir, gs.map)) {
          pac.dir = pac.nextDir;
        }
        if (canMove(pac.x, pac.y, pac.dir, gs.map)) {
          const np = move(pac.x, pac.y, pac.dir);
          pac.x = np.x;
          pac.y = np.y;
        }

        // eat dot
        if (gs.map[pac.y][pac.x] === 2) {
          gs.map[pac.y][pac.x] = 0;
          gs.score += 10;
          setScore(gs.score);
        }
        // eat power pellet
        if (gs.map[pac.y][pac.x] === 3) {
          gs.map[pac.y][pac.x] = 0;
          gs.score += 50;
          gs.powerTimer = 60;
          gs.ghosts.forEach(g => g.scared = true);
          setScore(gs.score);
        }

        if (gs.powerTimer > 0) {
          gs.powerTimer--;
          if (gs.powerTimer === 0) {
            gs.ghosts.forEach(g => g.scared = false);
          }
        }

        // check collision
        for (const ghost of gs.ghosts) {
          if (ghost.x === pac.x && ghost.y === pac.y) {
            if (ghost.scared) {
              ghost.x = 9; ghost.y = 9; ghost.scared = false;
              gs.score += 200;
              setScore(gs.score);
            } else {
              gs.running = false;
              setGameOver(true);
              setHighScore(prev => Math.max(prev, gs.score));
              return;
            }
          }
        }

        // check win
        const dotsLeft = gs.map.flat().filter(c => c === 2 || c === 3).length;
        if (dotsLeft === 0) {
          gs.running = false;
          setGameOver(true);
          gs.score += 1000;
          setScore(gs.score);
          setHighScore(prev => Math.max(prev, gs.score));
          return;
        }
      }

      // move ghosts
      if (ghostTick) {
        for (const ghost of gs.ghosts) {
          const possible = dirs.filter(d => canMove(ghost.x, ghost.y, d, gs.map));
          if (possible.length > 0) {
            // prefer not to reverse
            const opposite: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
            const preferred = possible.filter(d => d !== opposite[ghost.dir]);
            const choices = preferred.length > 0 ? preferred : possible;

            if (ghost.scared) {
              // random when scared
              ghost.dir = choices[Math.floor(Math.random() * choices.length)];
            } else {
              // simple chase: prefer direction toward pac-man
              const pac = gs.pacman;
              const dx = pac.x - ghost.x;
              const dy = pac.y - ghost.y;
              let best = choices[0];
              let bestDist = Infinity;
              for (const d of choices) {
                const np = move(ghost.x, ghost.y, d);
                const dist = Math.abs(np.x - pac.x) + Math.abs(np.y - pac.y);
                // add some randomness
                if (dist < bestDist || Math.random() < 0.2) {
                  bestDist = dist;
                  best = d;
                }
              }
              ghost.dir = best;
            }

            const np = move(ghost.x, ghost.y, ghost.dir);
            ghost.x = np.x;
            ghost.y = np.y;

            // check collision after ghost moves
            if (ghost.x === gs.pacman.x && ghost.y === gs.pacman.y) {
              if (ghost.scared) {
                ghost.x = 9; ghost.y = 9; ghost.scared = false;
                gs.score += 200;
                setScore(gs.score);
              } else {
                gs.running = false;
                setGameOver(true);
                setHighScore(prev => Math.max(prev, gs.score));
                return;
              }
            }
          }
        }
      }

      // Draw
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Draw map
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const cell = gs.map[y][x];
          if (cell === 1) {
            ctx.fillStyle = '#2121DE';
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            // inner dark to create maze look
            ctx.fillStyle = '#1818AA';
            ctx.fillRect(x * CELL + 2, y * CELL + 2, CELL - 4, CELL - 4);
          } else if (cell === 2) {
            ctx.fillStyle = '#FFB8FF';
            ctx.beginPath();
            ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (cell === 3) {
            ctx.fillStyle = '#FFB8FF';
            ctx.beginPath();
            ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw pac-man
      const pac = gs.pacman;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      const px = pac.x * CELL + CELL / 2;
      const py = pac.y * CELL + CELL / 2;
      const mouthAngle = pac.mouthOpen ? 0.3 : 0.05;
      let startAngle = 0;
      if (pac.dir === 'right') startAngle = 0;
      if (pac.dir === 'down') startAngle = Math.PI / 2;
      if (pac.dir === 'left') startAngle = Math.PI;
      if (pac.dir === 'up') startAngle = -Math.PI / 2;
      ctx.arc(px, py, CELL / 2 - 1, startAngle + mouthAngle * Math.PI, startAngle - mouthAngle * Math.PI + 2 * Math.PI);
      ctx.lineTo(px, py);
      ctx.fill();

      // Draw ghosts
      for (const ghost of gs.ghosts) {
        ctx.fillStyle = ghost.scared ? '#2121DE' : ghost.color;
        const gx = ghost.x * CELL;
        const gy = ghost.y * CELL;
        // body
        ctx.fillRect(gx + 2, gy + 4, CELL - 4, CELL - 6);
        // head
        ctx.beginPath();
        ctx.arc(gx + CELL / 2, gy + 6, CELL / 2 - 2, Math.PI, 0);
        ctx.fill();
        // feet
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(gx + 3 + i * 5, gy + CELL - 2, 2, 0, Math.PI);
          ctx.fill();
        }
        // eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(gx + 4, gy + 5, 3, 4);
        ctx.fillRect(gx + 10, gy + 5, 3, 4);
        ctx.fillStyle = ghost.scared ? '#FFF' : '#000';
        ctx.fillRect(gx + 5, gy + 7, 2, 2);
        ctx.fillRect(gx + 11, gy + 7, 2, 2);
      }

    }, 1000 / 60);

    return () => {
      gs.running = false;
      clearInterval(interval);
    };
  }, [isPlaying, gameOver, canMove, move]);

  if (!isPlaying) {
    return (
      <div className="text-center py-10">
        <h3 className="text-sm mb-2 glow-yellow">PAC-MAN</h3>
        <p className="text-[var(--text-muted)] mb-6" style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>
          You found the secret! Ready to play?
        </p>
        <button
          className="nf-btn nf-btn-primary"
          onClick={() => { resetGame(); setIsPlaying(true); }}
        >
          PLAY
        </button>
        {highScore > 0 && (
          <p className="text-[var(--pacman-yellow)] mt-4" style={{ fontFamily: 'VT323, monospace', fontSize: '18px' }}>
            HIGH SCORE: {highScore}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-10">
      <div className="flex justify-between w-full mb-4" style={{ maxWidth: W }}>
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px', color: 'var(--pacman-yellow)' }}>
          SCORE: {score}
        </span>
        <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '10px', color: 'var(--text-muted)' }}>
          HI: {Math.max(highScore, score)}
        </span>
      </div>
      <div style={{ border: '4px solid #2121DE', lineHeight: 0 }}>
        <canvas ref={canvasRef} width={W} height={H} />
      </div>
      <p className="mt-4 text-[var(--text-muted)]" style={{ fontFamily: 'VT323, monospace', fontSize: '16px' }}>
        USE ARROW KEYS OR WASD TO MOVE
      </p>
      {gameOver && (
        <div className="mt-6 text-center">
          <p className="mb-4 glow-yellow" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '12px' }}>
            GAME OVER
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="nf-btn nf-btn-primary"
              onClick={() => { resetGame(); }}
            >
              RETRY
            </button>
            <button
              className="nf-btn nf-btn-secondary"
              onClick={() => { setIsPlaying(false); resetGame(); }}
            >
              QUIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
