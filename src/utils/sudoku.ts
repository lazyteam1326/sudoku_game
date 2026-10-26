export type Board = (number | null)[][];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Create an empty 9x9 board
export function createEmptyBoard(): Board {
  return Array(9).fill(null).map(() => Array(9).fill(null));
}

// Check if a number is valid at a given position
export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// Shuffle an array in place (Fisher-Yates)
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Solve the board using backtracking
export function solve(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// Generate a complete solved board
export function generateSolvedBoard(): Board {
  const board = createEmptyBoard();
  solve(board);
  return board;
}

// Remove cells to create a puzzle based on difficulty
export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateSolvedBoard();
  const puzzle: Board = solution.map(row => [...row]);

  let cellsToRemove: number;
  switch (difficulty) {
    case 'easy':
      cellsToRemove = 35;
      break;
    case 'medium':
      cellsToRemove = 45;
      break;
    case 'hard':
      cellsToRemove = 52;
      break;
    case 'expert':
      cellsToRemove = 58;
      break;
    default:
      cellsToRemove = 40;
  }

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;
    puzzle[row][col] = null;
    removed++;
  }

  return { puzzle, solution };
}

// Check if the board is completely and correctly filled
export function isBoardComplete(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return false;
    }
  }
  return isBoardValid(board);
}

// Check if the current board state is valid (no conflicts)
export function isBoardValid(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const num = board[row][col];
      if (num !== null) {
        board[row][col] = null;
        if (!isValid(board, row, col, num)) {
          board[row][col] = num;
          return false;
        }
        board[row][col] = num;
      }
    }
  }
  return true;
}

// Get cells that conflict with the current cell
export function getConflicts(board: Board, row: number, col: number): [number, number][] {
  const num = board[row][col];
  if (num === null) return [];

  const conflicts: [number, number][] = [];

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) {
      conflicts.push([row, c]);
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) {
      conflicts.push([r, col]);
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) {
        conflicts.push([r, c]);
      }
    }
  }

  return conflicts;
}

// Count how many times a number appears in the board
export function countNumber(board: Board, num: number): number {
  let count = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === num) count++;
    }
  }
  return count;
}
