document.addEventListener('DOMContentLoaded', () => {
    // Player names
    let playerNames = {
        X: 'Player X',
        O: 'Player O'
    };
    
    // Game state variables
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameHistory = [];
    
    // Score tracking
    let scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    
    // Track winning line for highlighting
    let winningLine = [];
    
    // DOM Elements
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreDraw = document.getElementById('score-draw');
    const playerXName = document.getElementById('player-x-name');
    const playerOName = document.getElementById('player-o-name');
    const playerXInput = document.getElementById('player-x');
    const playerOInput = document.getElementById('player-o');
    const saveNamesButton = document.getElementById('save-names');
    const historyList = document.getElementById('history-list');
    
    // Sound effects
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const drawSound = document.getElementById('draw-sound');
    
    // Winning combinations (rows, columns, diagonals)
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    // Status messages
    const statusDisplay = document.getElementById('status');
    const winningMessage = () => `${playerNames[currentPlayer]} has won!`;
    const drawMessage = () => 'Game ended in a draw!';
    const currentPlayerTurn = () => `${playerNames[currentPlayer]}'s turn`;
    
    // Load data from local storage
    function loadFromLocalStorage() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        const savedNames = localStorage.getItem('ticTacToeNames');
        const savedHistory = localStorage.getItem('ticTacToeHistory');
        
        if (savedScores) {
            scores = JSON.parse(savedScores);
            updateScoreDisplay();
        }
        
        if (savedNames) {
            playerNames = JSON.parse(savedNames);
            playerXInput.value = playerNames.X;
            playerOInput.value = playerNames.O;
            updatePlayerNames();
        }
        
        if (savedHistory) {
            gameHistory = JSON.parse(savedHistory);
            updateHistoryDisplay();
        }
    }
    
    // Save data to local storage
    function saveToLocalStorage() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
        localStorage.setItem('ticTacToeNames', JSON.stringify(playerNames));
        localStorage.setItem('ticTacToeHistory', JSON.stringify(gameHistory));
    }
    
    // Update player names
    function updatePlayerNames() {
        playerXName.textContent = playerNames.X;
        playerOName.textContent = playerNames.O;
        statusDisplay.innerHTML = currentPlayerTurn();
    }
    
    // Handle save names button click
    saveNamesButton.addEventListener('click', () => {
        playerNames.X = playerXInput.value || 'Player X';
        playerNames.O = playerOInput.value || 'Player O';
        updatePlayerNames();
        saveToLocalStorage();
    });
    
    // Load saved data on page load
    loadFromLocalStorage();
    
    // Set initial status message
    statusDisplay.innerHTML = currentPlayerTurn();
    
    // Update history display
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        // Display only the last 5 games
        const recentHistory = gameHistory.slice(-5);
        
        recentHistory.forEach((game, index) => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.innerHTML = `
                <span>Game ${gameHistory.length - (recentHistory.length - 1 - index)}</span>
                <span>${game.result}</span>
                <span>${new Date(game.date).toLocaleString()}</span>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    // Update score display
    function updateScoreDisplay() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        scoreDraw.textContent = scores.draw;
    }
    
    // Handle cell click
    function handleCellClick(clickedCellEvent) {
        // Get clicked cell from event
        const clickedCell = clickedCellEvent.target;
        // Get data-cell-index attribute to identify the position on the board
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
        
        // Check if cell is already played or game is inactive
        if (gameState[clickedCellIndex] !== '' || !gameActive) {
            return;
        }
        
        // Play click sound
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Audio play failed:", e));
        }
        
        // Update game state and UI
        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
        
        // If game is still active and current player is O, make AI move if enabled
        if (gameActive && currentPlayer === 'O' && document.getElementById('ai-toggle').checked) {
            setTimeout(makeAIMove, 500);
        }
    }
    
    // Make AI move
    function makeAIMove() {
        const difficulty = document.getElementById('difficulty').value;
        let cellIndex;
        
        if (difficulty === 'easy') {
            cellIndex = makeRandomMove();
        } else if (difficulty === 'medium') {
            // 50% chance of making a smart move
            cellIndex = Math.random() < 0.5 ? makeSmartMove() : makeRandomMove();
        } else { // hard
            cellIndex = makeSmartMove();
        }
        
        if (cellIndex !== -1) {
            const cell = document.querySelector(`[data-cell-index="${cellIndex}"]`);
            // Play click sound
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            handleCellPlayed(cell, cellIndex);
            handleResultValidation();
        }
    }
    
    // Make a random move for AI
    function makeRandomMove() {
        const emptyCells = gameState.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        
        if (emptyCells.length === 0) return -1;
        
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    // Make a smart move for AI
    function makeSmartMove() {
        // Try to win
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            // Check if AI can win in this line
            if (gameState[a] === 'O' && gameState[b] === 'O' && gameState[c] === '') return c;
            if (gameState[a] === 'O' && gameState[c] === 'O' && gameState[b] === '') return b;
            if (gameState[b] === 'O' && gameState[c] === 'O' && gameState[a] === '') return a;
        }
        
        // Block player from winning
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            // Check if player can win in this line
            if (gameState[a] === 'X' && gameState[b] === 'X' && gameState[c] === '') return c;
            if (gameState[a] === 'X' && gameState[c] === 'X' && gameState[b] === '') return b;
            if (gameState[b] === 'X' && gameState[c] === 'X' && gameState[a] === '') return a;
        }
        
        // Take center if available
        if (gameState[4] === '') return 4;
        
        // Take corners if available
        const corners = [0, 2, 6, 8].filter(index => gameState[index] === '');
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        
        // Take any available edge
        const edges = [1, 3, 5, 7].filter(index => gameState[index] === '');
        if (edges.length > 0) return edges[Math.floor(Math.random() * edges.length)];
        
        return -1; // No move available
    }
    
    // Update game state and UI after a cell is played
    function handleCellPlayed(clickedCell, clickedCellIndex) {
        // Update internal game state
        gameState[clickedCellIndex] = currentPlayer;
        // Update UI
        clickedCell.innerHTML = currentPlayer;
        // Add class for styling and animation
        clickedCell.classList.add(`cell-${currentPlayer.toLowerCase()}`);
        clickedCell.classList.add('cellPlaced');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            clickedCell.classList.remove('cellPlaced');
        }, 500);
    }
    
    // Check for win or draw
    function handleResultValidation() {
        let roundWon = false;
        let winningLine = [];
        
        // Check all winning combinations
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const condition = gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c];
            
            if (condition) {
                roundWon = true;
                winningLine = [a, b, c];
                break;
            }
        }
        
        // Handle win
        if (roundWon) {
            statusDisplay.innerHTML = winningMessage();
            gameActive = false;
            
            // Highlight winning cells
            winningLine.forEach(index => {
                document.querySelector(`[data-cell-index="${index}"]`).classList.add('winning-cell');
            });
            
            // Play win sound
            if (winSound) {
                winSound.currentTime = 0;
                winSound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            // Update score
            scores[currentPlayer]++;
            updateScoreDisplay();
            
            // Add to game history
            addGameToHistory(`${playerNames[currentPlayer]} won`);
            
            // Save to local storage
            saveToLocalStorage();
            return;
        }
        
        // Handle draw
        const roundDraw = !gameState.includes('');
        if (roundDraw) {
            statusDisplay.innerHTML = drawMessage();
            gameActive = false;
            
            // Play draw sound
            if (drawSound) {
                drawSound.currentTime = 0;
                drawSound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            // Update draw score
            scores.draw++;
            updateScoreDisplay();
            
            // Add to game history
            addGameToHistory('Game ended in a draw');
            
            // Save to local storage
            saveToLocalStorage();
            return;
        }
        
        // If no win or draw, switch player
        handlePlayerChange();
    }
    
    // Add game to history
    function addGameToHistory(result) {
        const gameRecord = {
            date: new Date().toISOString(),
            result: result,
            board: [...gameState]
        };
        
        gameHistory.push(gameRecord);
        updateHistoryDisplay();
    }
    
    // Switch current player
    function handlePlayerChange() {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.innerHTML = currentPlayerTurn();
    }
    
    // Handle restart button click
    function handleRestartGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        statusDisplay.innerHTML = currentPlayerTurn();
        
        // Clear board
        document.querySelectorAll('.cell').forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('x');
            cell.classList.remove('o');
            cell.classList.remove('winning-cell');
        });
        
        // Note: Scores are preserved until page reload or clearing local storage
    }
    
    // Add event listeners
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    document.getElementById('restart').addEventListener('click', handleRestartGame);
    
    // AI toggle event listener
    const aiToggle = document.getElementById('ai-toggle');
    if (aiToggle) {
        aiToggle.addEventListener('change', function() {
            if (this.checked && gameActive && currentPlayer === 'O') {
                // If AI is enabled and it's O's turn, make a move
                setTimeout(makeAIMove, 500);
            }
        });
    }
    
    // Clear scores button
    const clearScoresButton = document.getElementById('clear-scores');
    if (clearScoresButton) {
        clearScoresButton.addEventListener('click', function() {
            scores = { X: 0, O: 0, draw: 0 };
            updateScoreDisplay();
            saveToLocalStorage();
        });
    }
});