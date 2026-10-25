import React from 'react';
import { Board, countNumber } from '../utils/sudoku';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onErase: () => void;
  onHint: () => void;
  board: Board;
  disabled?: boolean;
}

const NumberPad: React.FC<NumberPadProps> = ({
  onNumberClick,
  onErase,
  onHint,
  board,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const count = countNumber(board, num);
          const isComplete = count >= 9;
          return (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={disabled || isComplete}
              className={`
                relative flex flex-col items-center justify-center
                w-10 h-12 sm:w-12 sm:h-14 rounded-lg font-bold text-lg sm:text-xl
                transition-all duration-150
                ${isComplete
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md active:scale-95 shadow-sm border border-gray-200'
                }
              `}
            >
              {num}
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-normal absolute bottom-0.5">
                {9 - count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={onErase}
          disabled={disabled}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95 text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Erase
        </button>
        <button
          onClick={onHint}
          disabled={disabled}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-all active:scale-95 text-sm font-medium border border-amber-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
          Hint
        </button>
      </div>
    </div>
  );
};

export default NumberPad;
