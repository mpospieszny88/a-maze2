# A-Maze Game

A challenging maze game built with HTML5 Canvas and JavaScript.

## How to Play

1. Open `index.html` in your web browser to start the game.
2. Use the arrow keys (↑, →, ↓, ←) to navigate the green dot through the maze.
3. Your goal is to reach the red exit square.
4. Be careful! There's only one correct path to the exit, but many misleading dead ends.
5. Once you reach the exit, you'll see a "Great job! Wanna try again?" message.
6. Click anywhere on the game or press Enter to start a new randomized maze.

## Features

- Customizable grid size from 10x10 up to 50x50 using a slider
- Perfect maze generation (exactly one path between any two points)
- Misleading dead ends to increase difficulty
- Walls drawn as lines instead of full squares for better visibility
- Randomized maze generation for each new game
- Simple controls using arrow keys
- Responsive design

## Customization

You can customize the difficulty of the maze by adjusting the grid size:
1. Use the slider below the maze to select a grid size between 10x10 and 50x50.
2. Click the "Start Again!" button to generate a new maze with the selected grid size.
3. Larger grid sizes create more complex and challenging mazes.

## Technical Details

The maze is generated using a depth-first search algorithm with backtracking, which ensures that there is exactly one path from the start to the exit (a "perfect maze"). The algorithm starts with a grid full of walls and carves passages by removing walls between cells.

To make the maze more challenging, additional misleading paths (dead ends) are strategically added. The player starts at a random open cell, and the exit is placed at the furthest possible open cell from the player.

The game automatically adjusts the cell size based on the grid size to ensure the maze fits well on the screen.

## Files

- `index.html` - The main HTML file
- `style.css` - CSS styling for the game
- `maze.js` - JavaScript code for maze generation and game logic 