import { useState, useEffect } from "react";

const GRID_SIZE = 8;
let remaining =GRID_SIZE*GRID_SIZE;
let mines = 0;

function App() {
    const [grid, setGrid] = useState(
        Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => ({
            mine: false,
            revealed: false,
            adjacentMines: 0,
            flagged: false
        })))
    );
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [lastClicked, setLastClicked] = useState(null);
    const [win, setWin] = useState(false);

    function generateGrid(cx, cy, f=false) {
        const newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill().map(() => ({
            mine: false,
            revealed: false,
            adjacentMines: 0
        })));
        
        // Place mines
        for(let i = 0; i < GRID_SIZE; i++) {
            for(let j = 0; j < GRID_SIZE; j++) {
                if(i === cx && j === cy) continue;
                newGrid[i][j].mine = Math.random() < 0.1;
                if(newGrid[i][j].mine){
                    remaining--
                }
            }
        }
        mines = GRID_SIZE*GRID_SIZE-remaining;

        

        for(let i = 0; i < GRID_SIZE; i++) {
            for(let j = 0; j < GRID_SIZE; j++) {
                newGrid[i][j].adjacentMines = calculateAdjacentMines(i, j, newGrid);
            }
        }

        if(f){
            newGrid[cx][cy].flagged = true;
        }
        setGrid(newGrid);
        setGameStarted(true);
        if(!f) {
            setLastClicked([cx, cy]);
        }
        remaining--;
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
                            remaining--
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

    function checkCell(cx, cy, flagged=false) {


        if (remaining === 0) {
            console.log("win")
        }

        if(!gameStarted) {
            if(flagged){
                generateGrid(cx, cy,true);

            }
            else{
                generateGrid(cx, cy);
            }
            return;
        }
        if(grid[cx][cy].revealed || gameOver) return;

        const newGrid = grid.map(row => row.map(cell => ({...cell})));
        if(flagged){
            if(newGrid[cx][cy].flagged){
                newGrid[cx][cy].flagged = false;
                mines++
            }
            else{
                newGrid[cx][cy].flagged = true;
                mines--
            }

        }
        else{
            if(!newGrid[cx][cy].flagged){
                newGrid[cx][cy].revealed = true;
                remaining--
                setLastClicked([cx, cy]);
            }

        }

        if(remaining === 0){
            console.log("win")
            setWin(true);
        }
        setGrid(newGrid);

    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="flex flex-col items-center">
                <h1 className="text-4xl font-bold text-white animate-fade-in cursor-default">Minesweeper</h1>
                <div className="text-1lg mt-4 font-bold  text-red-500 animate-fade-in cursor-default">💣s: {mines}</div>
                {win ? <div className="text-1lg text-green-500 mt-4"> You Win! </div>:null}
                <div className="bg-gray-800 p-4 mt-2 rounded-lg animate-fade-in-delayed">
                    <div className={`grid grid-cols-${GRID_SIZE} gap-0.5`}>
                        {grid.map((row, i) =>
                            row.map((cell, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className={`w-10 h-10 border border-gray-600 rounded flex items-center justify-center
                                        ${cell.revealed 
                                            ? cell.mine 
                                                ? 'bg-red-500' 
                                            : cell.adjacentMines === 1 
                                                ? 'text-blue-300'
                                                    : cell.adjacentMines === 2
                                                    ? 'text-green-500' 
                                                    : cell.adjacentMines === 3
                                                    ? 'text-red-500'
                                                    : cell.adjacentMines === 4
                                                    ? 'text-purple-500' 
                                                            : cell.adjacentMines === 5
                                                    ? 'text-red-800'
                                                                : cell.adjacentMines === 6
                                                    ? 'text-teal-500' 
                                                                    : cell.adjacentMines === 7
                                                    ? 'text-white'
                                                                        :'text-gray-400'
                                                                
                                            : 'bg-gray-300 hover:bg-gray-400 cursor-pointer'}
                                            
                                            ${cell.revealed ? 'cursor-default animate-fade-out' : ''}
                                            `}


                                    onClick={() => checkCell(i, j)}
                                    onContextMenu={(event) => {
                                        event.preventDefault();
                                        checkCell(i, j,true);}}
                                >
                                    {cell.revealed && !cell.mine && cell.adjacentMines > 0 && (
                                        <span className="text-lg font-bold">
                                            {cell.adjacentMines}
                                        </span>
                                    )}
                                    {cell.revealed && cell.mine && '💣'}
                                    {!cell.revealed && cell.flagged  && '🚩'}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <button 
                    className="animate-fade-in-delayed-d mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer" 
                    onClick={() => {
                        remaining = GRID_SIZE * GRID_SIZE;
                        setGameStarted(false);
                        setGameOver(false);
                        setLastClicked(null);
                        setWin(false)
                        mines = 0;
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
