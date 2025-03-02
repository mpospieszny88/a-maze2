document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mazeCanvas');
    const ctx = canvas.getContext('2d');
    const messageElement = document.getElementById('message');
    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const gridSizeValue = document.getElementById('gridSizeValue');
    const gridSizeValue2 = document.getElementById('gridSizeValue2');
    const restartButton = document.getElementById('restartButton');

    // Mobile control buttons
    const btnUp = document.getElementById('btnUp');
    const btnRight = document.getElementById('btnRight');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const mobileControls = document.querySelector('.mobile-controls');

    // Game settings
    let gridSize = parseInt(gridSizeSlider.value); // Get initial value from slider
    let cellSize = calculateCellSize(gridSize); // Calculate cell size based on grid size
    
    // Set canvas dimensions
    function updateCanvasSize() {
        // Calculate cell size based on current grid size and screen dimensions
        cellSize = calculateCellSize(gridSize);
        
        // Set canvas dimensions
        canvas.width = gridSize * cellSize;
        canvas.height = gridSize * cellSize;
    }
    
    // Calculate appropriate cell size based on grid size and screen size
    function calculateCellSize(size) {
        const gameContainer = document.querySelector('.game-container');
        const containerWidth = gameContainer ? gameContainer.clientWidth : window.innerWidth * 0.8;
        
        // Calculate the cell size based on available width and height
        const widthBased = Math.floor(containerWidth / size);
        const heightBased = Math.floor(window.innerHeight * 0.6 / size);
        
        // Ensure cell size is never too small
        const minCellSize = 8;
        return Math.max(Math.min(widthBased, heightBased), minCellSize);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        updateCanvasSize();
        drawMaze();
        
        // Center mobile controls if they're visible
        if (window.getComputedStyle(mobileControls).display !== 'none') {
            centerMobileControls();
        }
    });
    
    updateCanvasSize();
    
    // Game state
    let maze = [];
    let playerPosition = { x: 0, y: 0 };
    let exitPosition = { x: 0, y: 0 };
    let gameFinished = false;
    
    // Initialize the game
    initGame();
    
    // Event listeners for keyboard
    document.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('click', handleClick);
    
    // Event listeners for mobile controls
    btnUp.addEventListener('click', () => movePlayer(0, -1));
    btnRight.addEventListener('click', () => movePlayer(1, 0));
    btnDown.addEventListener('click', () => movePlayer(0, 1));
    btnLeft.addEventListener('click', () => movePlayer(-1, 0));
    
    // Touch event listeners for mobile controls with better response
    btnUp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlayer(0, -1);
    });
    
    btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlayer(1, 0);
    });
    
    btnDown.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlayer(0, 1);
    });
    
    btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePlayer(-1, 0);
    });
    
    // Update grid size display when slider changes
    gridSizeSlider.addEventListener('input', function() {
        const newSize = parseInt(this.value);
        gridSizeValue.textContent = newSize;
        gridSizeValue2.textContent = newSize;
    });
    
    // Restart button event listener
    restartButton.addEventListener('click', function() {
        gridSize = parseInt(gridSizeSlider.value);
        updateCanvasSize();
        initGame();
    });
    
    // Initialize the game
    function initGame() {
        generatePerfectMaze();
        addMisleadingPaths();
        setStartAndExit();
        drawMaze();
        gameFinished = false;
        messageElement.textContent = '';
    }
    
    // Generate a perfect maze (exactly one path between any two points)
    function generatePerfectMaze() {
        // Initialize grid with cells
        // 0: path, 1: wall, 2: visited during generation
        maze = Array(gridSize).fill().map(() => Array(gridSize).fill(1));
        
        // Start with a grid where all cells are walls
        // We'll work with odd-indexed cells to ensure walls between paths
        
        // Choose a random starting point with odd coordinates
        const startX = Math.floor(Math.random() * Math.floor(gridSize/2)) * 2 + 1;
        const startY = Math.floor(Math.random() * Math.floor(gridSize/2)) * 2 + 1;
        
        // Mark the starting cell as a path
        maze[startY][startX] = 0;
        
        // Use a stack for the depth-first search
        const stack = [{x: startX, y: startY}];
        
        // Continue until the stack is empty
        while (stack.length > 0) {
            // Get the current cell
            const current = stack[stack.length - 1];
            
            // Get unvisited neighbors with a wall between
            const neighbors = getUnvisitedNeighbors(current.x, current.y);
            
            if (neighbors.length > 0) {
                // Choose a random neighbor
                const randomIndex = Math.floor(Math.random() * neighbors.length);
                const next = neighbors[randomIndex];
                
                // Remove the wall between current and next
                const wallX = (current.x + next.x) / 2;
                const wallY = (current.y + next.y) / 2;
                maze[wallY][wallX] = 0;
                
                // Mark the next cell as a path
                maze[next.y][next.x] = 0;
                
                // Push the next cell to the stack
                stack.push(next);
            } else {
                // Backtrack
                stack.pop();
            }
        }
    }
    
    // Get unvisited neighbors with a wall between
    function getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        
        // Check in all four directions (up, right, down, left)
        const directions = [
            {dx: 0, dy: -2}, // Up
            {dx: 2, dy: 0},  // Right
            {dx: 0, dy: 2},  // Down
            {dx: -2, dy: 0}  // Left
        ];
        
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            
            // Check if the neighbor is within bounds and is a wall (unvisited)
            if (nx > 0 && nx < gridSize - 1 && ny > 0 && ny < gridSize - 1 && maze[ny][nx] === 1) {
                neighbors.push({x: nx, y: ny});
            }
        }
        
        // Shuffle the neighbors for randomness
        shuffleArray(neighbors);
        
        return neighbors;
    }
    
    // Add misleading paths (dead ends) to make the maze more challenging
    function addMisleadingPaths() {
        // Find walls that could be removed to create dead ends
        const potentialDeadEnds = [];
        
        for (let y = 1; y < gridSize - 1; y++) {
            for (let x = 1; x < gridSize - 1; x++) {
                if (maze[y][x] === 1) { // If it's a wall
                    // Count adjacent paths
                    let pathCount = 0;
                    if (x > 0 && maze[y][x-1] === 0) pathCount++;
                    if (x < gridSize - 1 && maze[y][x+1] === 0) pathCount++;
                    if (y > 0 && maze[y-1][x] === 0) pathCount++;
                    if (y < gridSize - 1 && maze[y+1][x] === 0) pathCount++;
                    
                    // If removing this wall would create a dead end (exactly one path connection)
                    if (pathCount === 1) {
                        potentialDeadEnds.push({x, y});
                    }
                }
            }
        }
        
        // Shuffle the potential dead ends
        shuffleArray(potentialDeadEnds);
        
        // Add a certain number of dead ends (about 15% of the grid size)
        const deadEndsToAdd = Math.floor(gridSize * gridSize * 0.15);
        for (let i = 0; i < Math.min(deadEndsToAdd, potentialDeadEnds.length); i++) {
            const {x, y} = potentialDeadEnds[i];
            maze[y][x] = 0; // Convert wall to path to create a dead end
        }
    }
    
    // Set random start and exit positions
    function setStartAndExit() {
        // Find valid positions (open cells)
        const openCells = [];
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (maze[y][x] === 0) {
                    openCells.push({ x, y });
                }
            }
        }
        
        // Shuffle the open cells
        shuffleArray(openCells);
        
        // Set player position to the first open cell
        playerPosition = { ...openCells[0] };
        
        // Set exit position to a distant open cell
        // Find the furthest cell from the player
        let maxDistance = 0;
        let furthestCell = null;
        
        for (const cell of openCells) {
            const distance = Math.abs(cell.x - playerPosition.x) + Math.abs(cell.y - playerPosition.y);
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestCell = cell;
            }
        }
        
        exitPosition = { ...furthestCell };
    }
    
    // Draw the maze on the canvas
    function drawMaze() {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill the background
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the maze with lines instead of full squares
        ctx.strokeStyle = '#333';
        ctx.lineWidth = Math.max(1, cellSize / 10); // Adjust line width based on cell size
        
        // Draw horizontal walls
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize - 1; x++) {
                if ((maze[y][x] === 1 || maze[y][x+1] === 1) && 
                    (y === 0 || y === gridSize - 1 || 
                     (maze[y][x] === 1 && maze[y][x+1] === 1) ||
                     (maze[y][x] === 0 && maze[y][x+1] === 1) ||
                     (maze[y][x] === 1 && maze[y][x+1] === 0))) {
                    const startX = x * cellSize + cellSize;
                    const startY = y * cellSize;
                    const endX = startX;
                    const endY = startY + cellSize;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }
        
        // Draw vertical walls
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize - 1; y++) {
                if ((maze[y][x] === 1 || maze[y+1][x] === 1) && 
                    (x === 0 || x === gridSize - 1 || 
                     (maze[y][x] === 1 && maze[y+1][x] === 1) ||
                     (maze[y][x] === 0 && maze[y+1][x] === 1) ||
                     (maze[y][x] === 1 && maze[y+1][x] === 0))) {
                    const startX = x * cellSize;
                    const startY = y * cellSize + cellSize;
                    const endX = startX + cellSize;
                    const endY = startY;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }
        
        // Draw outer border
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Draw exit
        const exitX = exitPosition.x * cellSize;
        const exitY = exitPosition.y * cellSize;
        ctx.fillStyle = 'red';
        ctx.fillRect(exitX, exitY, cellSize, cellSize);
        
        // Draw player
        const playerX = playerPosition.x * cellSize;
        const playerY = playerPosition.y * cellSize;
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(playerX + cellSize / 2, playerY + cellSize / 2, Math.max(cellSize / 4, 3), 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Function to move the player
    function movePlayer(dx, dy) {
        if (gameFinished) {
            initGame();
            return;
        }
        
        let newX = playerPosition.x + dx;
        let newY = playerPosition.y + dy;
        
        // Check if the new position is valid
        if (isValidMove(newX, newY)) {
            playerPosition.x = newX;
            playerPosition.y = newY;
            drawMaze();
            checkWin();
        }
    }
    
    // Handle keyboard input
    function handleKeyPress(e) {
        if (gameFinished) {
            if (e.key === 'Enter') {
                initGame();
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowUp':
                movePlayer(0, -1);
                break;
            case 'ArrowRight':
                movePlayer(1, 0);
                break;
            case 'ArrowDown':
                movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                movePlayer(-1, 0);
                break;
            default:
                return; // Ignore other keys
        }
    }
    
    // Handle mouse click
    function handleClick() {
        if (gameFinished) {
            initGame();
        }
    }
    
    // Check if a move is valid
    function isValidMove(x, y) {
        // Check if the position is within bounds
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
            return false;
        }
        
        // Check if there's a wall between current position and new position
        const dx = x - playerPosition.x;
        const dy = y - playerPosition.y;
        
        // Only allow moves to adjacent cells
        if (Math.abs(dx) + Math.abs(dy) !== 1) {
            return false;
        }
        
        // Check if the position is a path (not a wall)
        return maze[y][x] === 0 || (x === exitPosition.x && y === exitPosition.y);
    }
    
    // Check if the player has reached the exit
    function checkWin() {
        if (playerPosition.x === exitPosition.x && playerPosition.y === exitPosition.y) {
            gameFinished = true;
            messageElement.textContent = 'Great job! Wanna try again?';
        }
    }
    
    // Utility function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Function to center mobile controls
    function centerMobileControls() {
        mobileControls.style.margin = '10px auto';
        mobileControls.style.alignSelf = 'center';
    }
    
    // Add event listener for media query changes to check when mobile controls become visible
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
            // Mobile controls will be visible, center them
            centerMobileControls();
        }
    });
    
    // Initial check
    if (mediaQuery.matches) {
        centerMobileControls();
    }
}); 