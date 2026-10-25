import React from 'react';
import { Board, getConflicts } from '../utils/sudoku';

interface SudokuBoardProps {
  board: Board;
  initialBoard: Board;
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  showConflicts: boolean;
}

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  initialBoard,
  selectedCell,
  onCellClick,
  showConflicts,
}) => {
  const getCellClasses = (row: number, col: number): string => {
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;
    const isInitial = initialBoard[row][col] !== null;
    const isSameRow = selectedCell && selectedCell[0] === row;
    const isSameCol = selectedCell && selectedCell[1] === col;
    const isSameBox =
      selectedCell &&
      Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell[1] / 3) === Math.floor(col / 3);
    const isSameNumber =
      selectedCell &&
      board[selectedCell[0]][selectedCell[1]] !== null &&
      board[row][col] === board[selectedCell[0]][selectedCell[1]];

    let classes = 'relative flex items-center justify-center cursor-pointer select-none transition-all duration-100 ';

    // Border classes for 3x3 boxes
    if (col % 3 === 0 && col !== 0) classes += 'border-l-2 border-l-gray-800 ';
    if (row % 3 === 0 && row !== 0) classes += 'border-t-2 border-t-gray-800 ';

    // Outer borders
    if (col === 0) classes += 'border-l-2 border-l-gray-800 ';
    if (col === 8) classes += 'border-r-2 border-r-gray-800 ';
    if (row === 0) classes += 'border-t-2 border-t-gray-800 ';
    if (row === 8) classes += 'border-b-2 border-b-gray-800 ';

    // Inner borders
    if (col !== 0 && col % 3 !== 0) classes += 'border-l border-l-gray-300 ';
    if (row !== 0 && row % 3 !== 0) classes += 'border-t border-t-gray-300 ';

    // Background colors
    if (isSelected) {
      classes += 'bg-blue-200 ';
    } else if (isSameNumber && !isInitial) {
      classes += 'bg-blue-100 ';
    } else if (isSameRow || isSameCol || isSameBox) {
      classes += 'bg-blue-50 ';
    } else {
      classes += 'bg-white ';
    }

    // Text color
    if (isInitial) {
      classes += 'text-gray-800 font-bold ';
    } else {
      classes += 'text-blue-600 ';
    }

    // Conflict highlighting
    if (showConflicts && selectedCell && board[row][col] !== null) {
      const conflicts = getConflicts(board, row, col);
      if (conflicts.length > 0) {
        classes += 'bg-red-100 text-red-600 ';
      }
    }

    return classes;
  };

  return (
    <div className="inline-block bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-9">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClasses(rowIndex, colIndex)}
              onClick={() => onCellClick(rowIndex, colIndex)}
              style={{ width: 'clamp(32px, 8vw, 50px)', height: 'clamp(32px, 8vw, 50px)' }}
            >
              <span className="text-sm sm:text-lg md:text-xl">
                {cell !== null ? cell : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuBoard;
