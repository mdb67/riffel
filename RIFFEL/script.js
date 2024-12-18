const grid = [
  ['A', 'F', 'G', 'E', 'B', 'R', 'O', 'K', 'E', 'N'],
  ['Z', 'W', 'E', 'M', 'P', 'A', 'R', 'T', 'I', 'J'],
  ['B', 'R', 'U', 'T', 'O', 'W', 'I', 'N', 'S', 'T'],
  ['B', 'E', 'G', 'I', 'N', 'G', 'E', 'T', 'A', 'L'],
  ['T', 'O', 'P', 'S', 'A', 'L', 'A', 'R', 'I', 'S'],
  ['T', 'A', 'M', 'B', 'O', 'E', 'R', 'I', 'J', 'N'],
  ['K', 'O', 'E', 'P', 'E', 'L', 'Z', 'A', 'A', 'L']
];

const solutions = [
  [2, 5, 6, 8, 9], // "GROEN"
  [0, 1, 5, 6, 7], // "ZWART"
  [0, 1, 2, 6, 7], // "BRUIN"
  [0, 1, 3, 5, 6], // "BEIGE"
  [2, 4, 6, 7, 9], // "PAARS"
  [1, 2, 3, 5, 6], // "AMBER"
  [1, 3, 7, 8, 9]  // "OPAAL"
];

const gridContainer = document.getElementById('grid');
const startButton = document.getElementById('start-button');
const nextButton = document.getElementById('next-button');
let playerSelections = Array(grid.length).fill(null).map(() => []);
const blackedOutCells = new Set();
const lockedRows = new Set();
let gameStarted = false;

document.addEventListener('DOMContentLoaded', () => {
  createEmptyGrid();
});

// Create an empty grid on page load
function createEmptyGrid() {
  grid.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = `cell-${rowIndex}-${colIndex}`;
      gridContainer.appendChild(cell);
    });
  });
}

function populateGrid() {
  const totalCells = grid.length * grid[0].length; // Total number of cells in the grid
  let populatedCells = 0; // Counter for populated cells

  grid.forEach((row, rowIndex) => {
    row.forEach((letter, colIndex) => {
      const cell = document.getElementById(`cell-${rowIndex}-${colIndex}`);
      setTimeout(() => {
        cell.textContent = letter;
        cell.classList.add('letter');
        cell.addEventListener('click', () => toggleCell(rowIndex, colIndex));
        populatedCells++;

        // Check if all cells are populated
        if (populatedCells === totalCells) {
          console.log("All letters are visible.");
          // Start blackout or any subsequent logic here
          blackoutRandomNonTargetCell(); // Begin blackout after all letters
          setInterval(blackoutRandomNonTargetCell, 2000); // Continue blackout every 1.5 seconds
        }
      }, (rowIndex * 10 + colIndex) * 100); // Staggered animation
    });
  });
}

function toggleCell(rowIndex, colIndex) {
  if (lockedRows.has(rowIndex)) return; // Skip locked rows

  const selectedCells = playerSelections[rowIndex];
  const cellId = `cell-${rowIndex}-${colIndex}`;
  const cell = document.getElementById(cellId);

  // Toggle the cell selection state
  if (selectedCells.includes(colIndex)) {
    selectedCells.splice(selectedCells.indexOf(colIndex), 1);
    cell.classList.remove('orange');
  } else {
    selectedCells.push(colIndex);
    cell.classList.add('orange');
  }

  // Check if the correct sequence is selected
  if (selectedCells.length === 5) {
    // Ensure we compare arrays correctly (without sorting to avoid inconsistencies)
    const sortedSelected = [...selectedCells].sort();
    const sortedSolution = [...solutions[rowIndex]].sort();

    if (JSON.stringify(sortedSelected) === JSON.stringify(sortedSolution)) {
      selectedCells.forEach(index => {
        document.getElementById(`cell-${rowIndex}-${index}`).classList.add('green');
      });

      // Black out the rest of the cells
      grid[rowIndex].forEach((_, colIdx) => {
        if (!solutions[rowIndex].includes(colIdx)) {
          const otherCell = document.getElementById(`cell-${rowIndex}-${colIdx}`);
          otherCell.classList.add('greyed');
          blackedOutCells.add(`cell-${rowIndex}-${colIdx}`);
        }
      });

      lockedRows.add(rowIndex); // Lock the row
    }
  }
}

let blackoutCounts = {};  // Keep track of the number of blackouts for each row

function blackoutRandomNonTargetCell() {
  if (lockedRows.size === grid.length) return; // End blackout if all rows are locked

  // Get rows that are not locked
  const availableRows = grid.map((_, rowIndex) => rowIndex).filter(rowIndex => !lockedRows.has(rowIndex));
  const randomRowIndex = availableRows[Math.floor(Math.random() * availableRows.length)];
  const row = grid[randomRowIndex];
  const correctCells = solutions[randomRowIndex];

  // Calculate non-target cells
  const nonTargetIndices = row.map((_, colIndex) => colIndex)
    .filter(colIndex =>
      !correctCells.includes(colIndex) &&
      !blackedOutCells.has(`cell-${randomRowIndex}-${colIndex}`)
    );

  // If there are non-target cells to blackout
  if (nonTargetIndices.length > 0) {
    const randomColIndex = nonTargetIndices[Math.floor(Math.random() * nonTargetIndices.length)];
    const cellId = `cell-${randomRowIndex}-${randomColIndex}`;
    blackedOutCells.add(cellId);
    document.getElementById(cellId).classList.add('greyed');

    // Update the blackout count for the current row
    if (!blackoutCounts[randomRowIndex]) {
      blackoutCounts[randomRowIndex] = 0;
    }
    blackoutCounts[randomRowIndex]++;

    // Check if all non-target cells are blacked out for this row
    const totalNonTargetCells = row.length - correctCells.length;
    if (blackoutCounts[randomRowIndex] === totalNonTargetCells) {
      // Once all non-target cells are blacked out, mark target cells as red
      correctCells.forEach(colIndex => {
        const targetCellId = `cell-${randomRowIndex}-${colIndex}`;
        const targetCell = document.getElementById(targetCellId);
        targetCell.classList.add('red'); // Set the target cells to red background
        targetCell.style.color = 'white'; // Optional: Change text color for contrast
      });

      // Lock the row after marking target cells as red
      lockedRows.add(randomRowIndex);
    }
  }
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  gridContainer.style.visibility = 'visible';
  populateGrid();
}

startButton.addEventListener('click', startGame);
