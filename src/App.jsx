import { useState, useEffect } from "react";

const GRID_SIZE = 8;

function App() {
    const [grid, setGrid] = useState(
        Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => ({
            mine: false,
            revealed: false,
            adjacentMines: 0
        })))
    );
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [lastClicked, setLastClicked] = useState(null);

    function generateGrid(cx, cy) {
        const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => ({
            mine: false,
            revealed: false,
            adjacentMines: 0
        })));
        
        // Place mines
        for(let i = 0; i < GRID_SIZE; i++) {
            for(let j = 0; j < GRID_SIZE; j++) {
                if(i === cx && j === cy) continue;
                newGrid[i][j].mine = Math.random() < 0.2;
            }
        }
        

        for(let i = 0; i < GRID_SIZE; i++) {
            for(let j = 0; j < GRID_SIZE; j++) {
                newGrid[i][j].adjacentMines = calculateAdjacentMines(i, j, newGrid);
            }
        }

        setGrid(newGrid);
        setGameStarted(true);
        setLastClicked([cx, cy]);
    }

    function calculateAdjacentMines(x, y, currentGrid) {
        let count = 0;
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE && currentGrid[i][j].mine) {
                    count++;
                }
            }
        }
        return count;
    }

    useEffect(() => {
        if (!lastClicked) return;

        const [cx, cy] = lastClicked;
        const newGrid = grid.map(row => row.map(cell => ({...cell})));
        newGrid[cx][cy].revealed = true;
        if (newGrid[cx][cy].mine) {
            setGameOver(true);
            return;
        }

        if (newGrid[cx][cy].adjacentMines === 0) {
            const cellsToCheck = [[cx, cy]];
            
            while(cellsToCheck.length > 0) {
                const [x, y] = cellsToCheck.pop();
                
                for(let i = x - 1; i <= x + 1; i++) {
                    for(let j = y - 1; j <= y + 1; j++) {
                        if(i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE || (i === x && j === y)) continue;
                        
                        if(!newGrid[i][j].revealed && !newGrid[i][j].mine) {
                            newGrid[i][j].revealed = true;
                            
                            if(newGrid[i][j].adjacentMines === 0) {
                                cellsToCheck.push([i, j]);
                            }
                        }
                    }
                }
            }
        }

        setGrid(newGrid);
    }, [lastClicked]);

    function checkCell(cx, cy) {
        if(!gameStarted) {
            generateGrid(cx, cy);
            return;
        }

        if(grid[cx][cy].revealed || gameOver) return;

        const newGrid = grid.map(row => row.map(cell => ({...cell})));
        newGrid[cx][cy].revealed = true;
        setGrid(newGrid);
        setLastClicked([cx, cy]);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-6 text-white animate-fade-in cursor-default">Minesweeper</h1>
                <div className="bg-gray-800 p-4 rounded-lg animate-fade-in-delayed">
                    <div className="grid grid-cols-8 gap-0.5">
                        {grid.map((row, i) =>
                            row.map((cell, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className={`w-10 h-10 border border-gray-600 rounded cursor-pointer flex items-center justify-center
                                        ${cell.revealed 
                                            ? cell.mine 
                                                ? 'bg-red-500' 
                                                : 'text-white' 
                                            : 'bg-gray-300 hover:bg-gray-400'}`}
                                    onClick={() => checkCell(i, j)}
                                >
                                    {cell.revealed && !cell.mine && cell.adjacentMines > 0 && (
                                        <span className="text-lg font-bold">
                                            {cell.adjacentMines}
                                        </span>
                                    )}
                                    {cell.revealed && cell.mine && '💣'}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <button 
                    className="animate-fade-in-delayed-d mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer" 
                    onClick={() => {
                        setGameStarted(false);
                        setGameOver(false);
                        setLastClicked(null);
                        setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => ({
                            mine: false,
                            revealed: false,
                            adjacentMines: 0
                        }))));
                    }}
                >
                    Restart
                </button>
            </div>
        </div>
    );
}

export default App;
