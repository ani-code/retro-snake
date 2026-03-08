import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { playSound } from './audio';

export const BOARD_SIZE = 20; // 20x20 grid
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Moving UP
const BASE_SPEED = 200; // ms per tick

const THEMES = [
  { id: 'classic', name: 'NEON SLATE', unlockScore: 0, vars: { '--snake-color': '#10b981', '--snake-head': '#34d399', '--snake-glow': 'rgba(16, 185, 129, 0.6)', '--food-color': '#ef4444', '--food-glow': 'rgba(239, 68, 68, 0.8)' } },
  { id: 'cyberpunk', name: 'CYBERPUNK', unlockScore: 100, vars: { '--snake-color': '#f9a8d4', '--snake-head': '#f472b6', '--snake-glow': 'rgba(244, 114, 182, 0.6)', '--food-color': '#fde047', '--food-glow': 'rgba(253, 224, 71, 0.8)' } },
  { id: 'retro', name: 'RETRO NOKIA', unlockScore: 200, vars: { '--snake-color': '#4ade80', '--snake-head': '#22c55e', '--snake-glow': 'rgba(74, 222, 128, 0.6)', '--food-color': '#000000', '--food-glow': 'rgba(0,0,0,0)' } },
  { id: 'monochrome', name: 'GHOST', unlockScore: 300, vars: { '--snake-color': '#e2e8f0', '--snake-head': '#ffffff', '--snake-glow': 'rgba(255, 255, 255, 0.6)', '--food-color': '#94a3b8', '--food-glow': 'rgba(148, 163, 184, 0.8)' } }
];

export const generateFood = (snake) => {
  let newFood;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    // Ensure food doesn't spawn ON the snake
    const isOnSnake = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
    if (!isOnSnake) break;
  }
  return newFood;
};

export const checkCollision = (head, currentSnake) => {
  // Wall collision
  if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
    return true;
  }
  // Self collision
  for (let segment of currentSnake) {
    if (head.x === segment.x && head.y === segment.y) {
      return true;
    }
  }
  return false;
};

// --- Custom Hooks ---

// useInterval hook for game loop
function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// --- Components ---

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(BASE_SPEED);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);

  // New Mechanics State
  const [shrinkFood, setShrinkFood] = useState(null);
  const [combo, setCombo] = useState(1);
  const [comboTimer, setComboTimer] = useState(100); // 0 to 100%
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [hasPassedHighScore, setHasPassedHighScore] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Ref to prevent rapid reverse direction inputs in a single tick
  const inputQueueRef = useRef(INITIAL_DIRECTION);

  useEffect(() => {
    // Load leaderboard on mount
    const saved = localStorage.getItem('snakeLeaderboard');
    if (saved) {
      try {
        setLeaderboard(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse leaderboard from local storage", e);
      }
    }
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    inputQueueRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setShrinkFood(null);
    setCombo(1);
    setComboTimer(100);
    setScore(0);
    setSpeed(BASE_SPEED);
    setGameOver(false);
    setGameStarted(true);
    setIsNewHighScore(false);
    setHasPassedHighScore(false);
    setIsCelebrating(false);
  };


  const handleGameOver = () => {
    setGameOver(true);
    setGameStarted(false);
    setShake(true);
    setTimeout(() => setShake(false), 400); // Remove shake class

    // Haptic feedback & Sound
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    playSound('die');

    // Check high score qualification (top 5 max)
    const isQualifying = leaderboard.length < 5 || score > (leaderboard[leaderboard.length - 1]?.score || 0);
    if (score > 0 && isQualifying) {
      setIsNewHighScore(true);
    }
  };

  const gameLoop = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDir = inputQueueRef.current;
      const newHead = {
        x: head.x + currentDir.x,
        y: head.y + currentDir.y,
      };

      // Set actual direction to what was executed, so we can check against it next time
      setDirection(currentDir);

      if (checkCollision(newHead, prevSnake)) {
        handleGameOver();
        return prevSnake; // Game over, don't update snake positions
      }

      const newSnake = [newHead, ...prevSnake];

      // Handle Combo Timer Drain
      if (combo > 1) {
        setComboTimer(prev => prev - 5); // Drain 5% per tick
        if (comboTimer <= 0) {
          setCombo(1);
          setComboTimer(100);
        }
      }

      // Check Shrink Food consumption
      if (shrinkFood && newHead.x === shrinkFood.x && newHead.y === shrinkFood.y) {
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]); // trill
        playSound('shrink');
        setShrinkFood(null);
        // Shrink snake by up to 3 segments, but keep at least 3
        const targetLength = Math.max(3, newSnake.length - 3);
        while (newSnake.length > targetLength) {
          newSnake.pop();
        }
      }

      // Check Normal food consumption
      else if (newHead.x === food.x && newHead.y === food.y) {
        if (navigator.vibrate) navigator.vibrate(50); // small haptic pop
        playSound('eat');
        setScore((prevScore) => {
          const newScore = prevScore + 10;
          const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
          if (newScore > topScore && topScore > 0 && !hasPassedHighScore) {
            setHasPassedHighScore(true);
            setIsCelebrating(true);
            playSound('celebrate');
            setTimeout(() => setIsCelebrating(false), 2000); // 2 second celebration
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        // Increase speed slightly
        setSpeed((prevSpeed) => {
          // Speed up slightly every 5 apples to make it ~15% faster at those intervals
          if (newSnake.length % 5 === 0) {
            return Math.max(50, prevSpeed * 0.85);
          }
          return prevSpeed;
        });
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }

      return newSnake;
    });
  }, [direction, food, shrinkFood, combo, comboTimer, gameOver, gameStarted, leaderboard, score, hasPassedHighScore]);

  // Use custom interval hook for the main loop
  useInterval(gameLoop, (gameStarted && !gameOver) ? speed : null);

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default scrolling for arrow keys and space
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
      }

      const currentDir = direction;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) inputQueueRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) inputQueueRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) inputQueueRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) inputQueueRef.current = { x: 1, y: 0 };
          break;
        case 'Enter':
        case ' ': // Space mapping
          if (!gameStarted && !gameOver && !isNewHighScore) resetGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver, isNewHighScore]);


  // Touch gestures / Swipe Handlers (Basic implementation)
  const touchStartRef = useRef(null);

  const onTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const onTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartRef.current.x;
    const dy = touchEndY - touchStartRef.current.y;

    // Ensure significant movement to count as a swipe
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      const currentDir = direction;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && currentDir.x !== -1) inputQueueRef.current = { x: 1, y: 0 }; // Right
        else if (dx < 0 && currentDir.x !== 1) inputQueueRef.current = { x: -1, y: 0 }; // Left
      } else {
        // Vertical swipe
        if (dy > 0 && currentDir.y !== -1) inputQueueRef.current = { x: 0, y: 1 }; // Down
        else if (dy < 0 && currentDir.y !== 1) inputQueueRef.current = { x: 0, y: -1 }; // Up
      }
    }
    touchStartRef.current = null;
  };

  const handleMobileDpad = (x, y) => {
    const currentDir = direction;
    if (x === 0 && y === -1 && currentDir.y !== 1) inputQueueRef.current = { x: 0, y: -1 }; // Up
    if (x === 0 && y === 1 && currentDir.y !== -1) inputQueueRef.current = { x: 0, y: 1 }; // Down
    if (x === -1 && y === 0 && currentDir.x !== 1) inputQueueRef.current = { x: -1, y: 0 }; // Left
    if (x === 1 && y === 0 && currentDir.x !== -1) inputQueueRef.current = { x: 1, y: 0 }; // Right
  };


  return (
    <div
      className="app-container"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={currentTheme.vars}
    >
      <div className="score-board">
        <div className="score-item" style={{ alignItems: 'flex-start' }}>
          <span className="score-label">Score</span>
          <span className={`score-value ${isCelebrating ? 'score-celebrate' : ''}`}>
            {score} {combo > 1 && <span className="combo-text">x{combo}</span>}
          </span>
          {combo > 1 && (
            <div className="combo-bar-bg" style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '4px', borderRadius: '2px', overflow: 'hidden' }}>
              <div className="combo-bar-fill" style={{ width: `${comboTimer}%`, height: '100%', background: 'var(--food-color)', transition: 'width 0.1s linear' }} />
            </div>
          )}
        </div>
        <div className="score-item" style={{ alignItems: 'flex-end' }}>
          <span className="score-label">Top Score</span>
          <span className="score-value" style={{ color: 'var(--text-dim)', textShadow: 'none' }}>
            {leaderboard.length > 0 ? leaderboard[0].score : 0}
          </span>
        </div>
      </div>

      <div className={`game-board-container ${shake ? 'shake' : ''}`}>

        {/* Render Snake */}
        {snake.map((segment, index) => {
          // Calculate style based on position
          const style = {
            left: `calc(${segment.x} * var(--cell-size))`,
            top: `calc(${segment.y} * var(--cell-size))`,
          };
          return (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className={`entity snake-segment ${index === 0 ? 'snake-head' : ''}`}
              style={style}
            />
          );
        })}

        {/* Render Food */}
        <div
          className="entity food"
          style={{
            left: `calc(${food.x} * var(--cell-size))`,
            top: `calc(${food.y} * var(--cell-size))`,
          }}
        />

        {/* Render Shrink Food */}
        {shrinkFood && (
          <div
            className="entity shrink-food"
            style={{
              left: `calc(${shrinkFood.x} * var(--cell-size))`,
              top: `calc(${shrinkFood.y} * var(--cell-size))`,
            }}
          />
        )}
        {/* Start Screen Overlay */}
        {!gameStarted && !gameOver && (
          <div className="overlay">
            <h1 className="game-title arcade-font" style={{ marginBottom: '2rem' }}>SNAKE</h1>
            <button className="primary-btn" onClick={() => { playSound('select'); resetGame(); }}>START GAME</button>
            <p style={{ marginTop: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>Use arrow keys or swipe</p>

            {/* Theme Selector */}
            {leaderboard.length > 0 && (
              <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 className="arcade-font" style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>SELECT THEME</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {THEMES.map(theme => {
                    const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
                    const isUnlocked = topScore >= theme.unlockScore;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          if (isUnlocked) {
                            playSound('select');
                            setCurrentTheme(theme);
                          }
                        }}
                        className={`theme-btn ${currentTheme.id === theme.id ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                      >
                        {isUnlocked ? theme.name : `LOCKED (${theme.unlockScore})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="overlay">
            <h2 className="game-over-title arcade-font" style={{ marginTop: '0.5rem' }}>GAME OVER</h2>
            <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>Score: <span style={{ color: 'var(--snake-color)' }}>{score}</span></p>

            {/* Conditional Render: Initial Entry vs Standard Game Over */}
            {isNewHighScore ? (
              <NameEntryForm
                score={score}
                leaderboard={leaderboard}
                setLeaderboard={setLeaderboard}
                onComplete={() => setIsNewHighScore(false)}
              />
            ) : (
              <>
                <button className="primary-btn" onClick={() => { playSound('select'); resetGame(); }}>PLAY AGAIN</button>
                {leaderboard.length > 0 && (
                  <div style={{ marginTop: '1rem', width: '80%', maxWidth: '300px' }}>
                    <h3 className="arcade-font" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', color: 'var(--text-dim)', textAlign: 'center' }}>TOP SCORES</h3>
                    <div className="leaderboard-list">
                      {leaderboard.map((entry, idx) => (
                        <div key={idx} className="leaderboard-item">
                          <span>{idx + 1}. {entry.name}</span>
                          <span>{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile On-Screen D-Pad (only visible on mobile via CSS) */}
      <div className="mobile-controls">
        <button className="d-pad-btn btn-up" onClick={() => handleMobileDpad(0, -1)}>↑</button>
        <button className="d-pad-btn btn-left" onClick={() => handleMobileDpad(-1, 0)}>←</button>
        <button className="d-pad-btn btn-right" onClick={() => handleMobileDpad(1, 0)}>→</button>
        <button className="d-pad-btn btn-down" onClick={() => handleMobileDpad(0, 1)}>↓</button>
      </div>

    </div >
  );
}

// Sub-component for Arcade style name entry
function NameEntryForm({ score, leaderboard, setLeaderboard, onComplete }) {
  const [nameChars, setNameChars] = useState(['A', 'A', 'A']);
  const [activeIndex, setActiveIndex] = useState(0);

  // Re-use keydown listener to cycle characters
  useEffect(() => {
    const handleEntryKeys = (e) => {
      const charCode = nameChars[activeIndex].charCodeAt(0);

      if (e.key === 'ArrowUp' || e.key === 'w') {
        // Next char (A->B->C...Z->A)
        let newChar = String.fromCharCode(charCode + 1);
        if (newChar > 'Z') newChar = 'A';
        updateChar(newChar);
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        // Prev char (A->Z->Y...A)
        let newChar = String.fromCharCode(charCode - 1);
        if (newChar < 'A') newChar = 'Z';
        updateChar(newChar);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setActiveIndex((prev) => Math.min(2, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setActiveIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        playSound('select');
        submitScore();
      }
    };

    window.addEventListener('keydown', handleEntryKeys);
    return () => window.removeEventListener('keydown', handleEntryKeys);
  }, [activeIndex, nameChars]);

  const updateChar = (char) => {
    const newArr = [...nameChars];
    newArr[activeIndex] = char;
    setNameChars(newArr);
  };

  const submitScore = () => {
    const finalName = nameChars.join('');
    const newEntry = { name: finalName, score, timestamp: Date.now() };

    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Keep top 5

    setLeaderboard(newLeaderboard);
    localStorage.setItem('snakeLeaderboard', JSON.stringify(newLeaderboard));
    onComplete();
  };

  // Mobile specific controls for name entry
  const handleMobileCycle = (direction) => {
    const charCode = nameChars[activeIndex].charCodeAt(0);
    let newChar = String.fromCharCode(charCode + direction);
    if (newChar > 'Z') newChar = 'A';
    if (newChar < 'A') newChar = 'Z';
    updateChar(newChar);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <p style={{ color: 'var(--snake-color)', fontSize: '0.8rem', marginBottom: '0.3rem' }} className="arcade-font">NEW HIGH SCORE!</p>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ENTER INITIALS</p>

      <div className="name-entry">
        {nameChars.map((char, i) => (
          <div
            key={i}
            className={`name-char ${i === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Mobile helper buttons for char cycling since swiping is hard here */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="d-pad-small-btn" onClick={() => { playSound('select'); handleMobileCycle(1); }}>↑</button>
        <button className="d-pad-small-btn" onClick={() => { playSound('select'); handleMobileCycle(-1); }}>↓</button>
      </div>

      <button className="primary-btn" onClick={() => { playSound('select'); submitScore(); }} style={{ marginTop: '0.5rem' }}>SUBMIT</button>
    </div>
  );
}

export default App;
