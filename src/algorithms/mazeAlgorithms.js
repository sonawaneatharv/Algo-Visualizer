export function randomMaze(grid) {
  const wallsToAnimate = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (
        (row === grid.length / 2 && col === grid[0].length / 4) ||
        (row === grid.length / 2 && col === (grid[0].length / 4) * 3)
      ) {
        continue;
      }
      if (Math.random() < 0.25) {
        wallsToAnimate.push(grid[row][col]);
      }
    }
  }
  return wallsToAnimate;
}

export function weightMaze(grid) {
  const weightsToAnimate = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (
        (row === grid.length / 2 && col === grid[0].length / 4) ||
        (row === grid.length / 2 && col === (grid[0].length / 4) * 3)
      ) {
        continue;
      }
      if (Math.random() < 0.25) {
        weightsToAnimate.push(grid[row][col]);
      }
    }
  }
  return weightsToAnimate;
}

export function recursiveDivisionMaze(grid, startNode, finishNode, type = 'normal') {
  const wallsToAnimate = [];
  
  // Add border walls
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (r === 0 || c === 0 || r === grid.length - 1 || c === grid[0].length - 1) {
        wallsToAnimate.push(grid[r][c]);
      }
    }
  }
  
  // Inside recursive call
  divide(grid, 1, grid.length - 2, 1, grid[0].length - 2, chooseOrientation(grid[0].length - 2, grid.length - 2, type), wallsToAnimate, type);
  
  return wallsToAnimate.filter(node => 
    !(node.row === startNode.row && node.col === startNode.col) &&
    !(node.row === finishNode.row && node.col === finishNode.col)
  );
}

function divide(grid, rowStart, rowEnd, colStart, colEnd, orientation, wallsToAnimate, type) {
  if (rowEnd < rowStart || colEnd < colStart) return;

  const isHorizontal = orientation === 'horizontal';

  let possibleRows = [];
  for (let i = rowStart; i <= rowEnd; i += 2) possibleRows.push(i);
  let possibleCols = [];
  for (let i = colStart; i <= colEnd; i += 2) possibleCols.push(i);

  let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
  let randomColIndex = Math.floor(Math.random() * possibleCols.length);

  let currentRow = possibleRows[randomRowIndex];
  let currentCol = possibleCols[randomColIndex];

  let randomRowPassageIndex = Math.floor(Math.random() * possibleRows.length);
  let randomColPassageIndex = Math.floor(Math.random() * possibleCols.length);

  let rowPassage = isHorizontal ? currentRow : possibleRows[randomRowPassageIndex];
  let colPassage = isHorizontal ? possibleCols[randomColPassageIndex] : currentCol;

  let dx = isHorizontal ? 0 : 1;
  let dy = isHorizontal ? 1 : 0;

  let length = isHorizontal ? colEnd - colStart + 1 : rowEnd - rowStart + 1;
  let startX = isHorizontal ? currentRow : rowStart;
  let startY = isHorizontal ? colStart : currentCol;

  for (let i = 0; i < length; i++) {
    let r = startX + (dx * i);
    let c = startY + (dy * i);
    if (r !== rowPassage || c !== colPassage) {
      wallsToAnimate.push(grid[r][c]);
    }
  }

  if (isHorizontal) {
    divide(grid, rowStart, currentRow - 2, colStart, colEnd, chooseOrientation(colEnd - colStart + 1, currentRow - 2 - rowStart + 1, type), wallsToAnimate, type);
    divide(grid, currentRow + 2, rowEnd, colStart, colEnd, chooseOrientation(colEnd - colStart + 1, rowEnd - (currentRow + 2) + 1, type), wallsToAnimate, type);
  } else {
    divide(grid, rowStart, rowEnd, colStart, currentCol - 2, chooseOrientation(currentCol - 2 - colStart + 1, rowEnd - rowStart + 1, type), wallsToAnimate, type);
    divide(grid, rowStart, rowEnd, currentCol + 2, colEnd, chooseOrientation(colEnd - (currentCol + 2) + 1, rowEnd - rowStart + 1, type), wallsToAnimate, type);
  }
}

function chooseOrientation(width, height, type) {
  if (type === 'horizontal') return 'horizontal';
  if (type === 'vertical') return 'vertical';
  if (width < height) {
    return 'horizontal';
  } else if (height < width) {
    return 'vertical';
  } else {
    return Math.random() < 0.5 ? 'horizontal' : 'vertical';
  }
}

export function simpleStairPattern(grid) {
  const wallsToAnimate = [];
  let row = grid.length - 1;
  let col = 0;
  
  while (row > 0 && col < grid[0].length) {
    wallsToAnimate.push(grid[row][col]);
    row--;
    col++;
  }
  while (row < grid.length - 2 && col < grid[0].length) {
    wallsToAnimate.push(grid[row][col]);
    row++;
    col++;
  }
  while (row > 0 && col < grid[0].length - 1) {
    wallsToAnimate.push(grid[row][col]);
    row--;
    col++;
  }
  return wallsToAnimate;
}
