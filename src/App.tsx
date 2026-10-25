import React, { useState, useEffect, useCallback } from 'react';
import SudokuBoard from './components/SudokuBoard';
import NumberPad from './components/NumberPad';
import {
  Board,
  Difficulty,
  generatePuzzle,
  isBoardComplete,
  getConflicts,
  createEmptyBoard,
} from './utils/sudoku';

type PencilMarks = Set<number>[][];

function createEmptyPencilMarks(): PencilMarks {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => new Set<number>())
  );
}

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [initialBoard, setInitialBoard] = useState<Board>(createEmptyBoard());
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [solution, setSolution] = useState<Board>(createEmptyBoard());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showConflicts, setShowConflicts] = useState(true);
  const [pencilMarks, setPencilMarks] = useState<PencilMarks>(createEmptyPencilMarks());
  const [isPencilMode, setIsPencilMode] = useState(false);

  // Start a new game
  const startNewGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setInitialBoard(puzzle.map(row => [...row]));
    setBoard(puzzle.map(row => [...row]));
    setSolution(sol);
    setSelectedCell(null);
    setGameWon(false);
    setTimer(0);
    setIsRunning(true);
    setMistakes(0);
    setHintsUsed(0);
    setDifficulty(diff);
    setPencilMarks(createEmptyPencilMarks());
    setIsPencilMode(false);
  }, []);

  // Initialize game on first load
  useEffect(() => {
    startNewGame('medium');
  }, [startNewGame]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !gameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameWon]);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameWon) return;
    setSelectedCell([row, col]);
  };

  // Remove a pencil mark from related cells (same row, col, box) when a number is placed
  const removePencilMarkFromRelated = (marks: PencilMarks, row: number, col: number, num: number): PencilMarks => {
    const newMarks = marks.map(r => r.map(cell => new Set(cell)));

    // Remove from same row
    for (let c = 0; c < 9; c++) {
      newMarks[row][c].delete(num);
    }

    // Remove from same column
    for (let r = 0; r < 9; r++) {
      newMarks[r][col].delete(num);
    }

    // Remove from same 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        newMarks[r][c].delete(num);
      }
    }

    return newMarks;
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell || gameWon) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== null) return; // Can't modify initial cells

    if (isPencilMode) {
      // Toggle pencil mark
      const newMarks = pencilMarks.map(r => r.map(cell => new Set(cell)));
      if (newMarks[row][col].has(num)) {
        newMarks[row][col].delete(num);
      } else {
        newMarks[row][col].add(num);
      }
      setPencilMarks(newMarks);
    } else {
      // Normal mode - place number
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = num;
      setBoard(newBoard);

      // Clear pencil marks for this cell and remove from related cells
      let newMarks = pencilMarks.map(r => r.map(cell => new Set(cell)));
      newMarks[row][col].clear();
      newMarks = removePencilMarkFromRelated(newMarks, row, col, num);
      setPencilMarks(newMarks);

      // Check if this is a mistake
      if (solution[row][col] !== num) {
        setMistakes(prev => prev + 1);
      }

      // Check if game is complete
      if (isBoardComplete(newBoard)) {
        setGameWon(true);
        setIsRunning(false);
      }
    }
  };

  // Handle erase
  const handleErase = () => {
    if (!selectedCell || gameWon) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== null) return;

    if (isPencilMode) {
      // Clear all pencil marks for this cell
      const newMarks = pencilMarks.map(r => r.map(cell => new Set(cell)));
      newMarks[row][col].clear();
      setPencilMarks(newMarks);
    } else {
      // Clear the cell value
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = null;
      setBoard(newBoard);
    }
  };

  // Handle hint
  const handleHint = () => {
    if (!selectedCell || gameWon) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== null) return;
    if (board[row][col] === solution[row][col]) return; // Already correct

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = solution[row][col];
    setBoard(newBoard);
    setHintsUsed(prev => prev + 1);

    // Clear pencil marks for this cell and remove from related cells
    let newMarks = pencilMarks.map(r => r.map(cell => new Set(cell)));
    newMarks[row][col].clear();
    newMarks = removePencilMarkFromRelated(newMarks, row, col, solution[row][col]!);
    setPencilMarks(newMarks);

    // Check if game is complete
    if (isBoardComplete(newBoard)) {
      setGameWon(true);
      setIsRunning(false);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleErase();
      } else if (e.key === 'ArrowUp' && selectedCell) {
        e.preventDefault();
        const newRow = selectedCell[0] > 0 ? selectedCell[0] - 1 : 8;
        setSelectedCell([newRow, selectedCell[1]]);
      } else if (e.key === 'ArrowDown' && selectedCell) {
        e.preventDefault();
        const newRow = selectedCell[0] < 8 ? selectedCell[0] + 1 : 0;
        setSelectedCell([newRow, selectedCell[1]]);
      } else if (e.key === 'ArrowLeft' && selectedCell) {
        e.preventDefault();
        const newCol = selectedCell[1] > 0 ? selectedCell[1] - 1 : 8;
        setSelectedCell([selectedCell[0], newCol]);
      } else if (e.key === 'ArrowRight' && selectedCell) {
        e.preventDefault();
        const newCol = selectedCell[1] < 8 ? selectedCell[1] + 1 : 0;
        setSelectedCell([selectedCell[0], newCol]);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPencilMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, board, gameWon, isPencilMode, pencilMarks]);

  // Count filled cells
  const filledCells = board.flat().filter(cell => cell !== null).length;
  const progress = Math.round((filledCells / 81) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">9</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Sudoku</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="font-mono font-medium">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{mistakes} mistakes</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-5">
        {/* Difficulty selector */}
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => startNewGame(diff)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${difficulty === diff
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{filledCells}/81 cells</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Game Board */}
        <div className="relative">
          <SudokuBoard
            board={board}
            initialBoard={initialBoard}
            selectedCell={selectedCell}
            onCellClick={handleCellClick}
            showConflicts={showConflicts}
            pencilMarks={pencilMarks}
          />

          {/* Win overlay */}
          {gameWon && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Congratulations!</h2>
              <p className="text-gray-500 mb-4">
                You solved it in {formatTime(timer)} with {mistakes} mistake{mistakes !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => startNewGame(difficulty)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all active:scale-95"
              >
                New Game
              </button>
            </div>
          )}
        </div>

        {/* Pencil Mode Toggle */}
        <button
          onClick={() => setIsPencilMode(prev => !prev)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
            ${isPencilMode
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          {isPencilMode ? 'Pencil Mode ON' : 'Pencil Mode'}
          <span className="text-xs opacity-70">(P)</span>
        </button>

        {/* Number Pad */}
        <NumberPad
          onNumberClick={handleNumberInput}
          onErase={handleErase}
          onHint={handleHint}
          board={board}
          disabled={gameWon}
          isPencilMode={isPencilMode}
        />

        {/* Settings */}
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showConflicts}
              onChange={(e) => setShowConflicts(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-600">Highlight conflicts</span>
          </label>
          <button
            onClick={() => startNewGame(difficulty)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Restart
          </button>
        </div>

        {/* Hints used */}
        {hintsUsed > 0 && (
          <p className="text-xs text-gray-400">
            💡 {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''} used
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-gray-400">
        Arrow keys to navigate • 1-9 to fill • Backspace to erase • P to toggle pencil mode
      </footer>
    </div>
  );
}

export default App;
