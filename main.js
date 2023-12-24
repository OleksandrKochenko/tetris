const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;

const TETROMINO_NAMES = ["O", "L", "J", "S", "Z", "T", "I"];

const TETROMINOES = {
  O: [
    [1, 1],
    [1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

let playfield;
let tetromino;

function convertPositionToIndex(row, column) {
  return row * PLAYFIELD_COLUMNS + column;
}

function generatePlayField() {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    document.querySelector(".tetris").append(div);
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill(0)
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
}

function generateTetromino(name) {
  const matrix = JSON.parse(JSON.stringify(TETROMINOES[name]));

  const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
  const row = 0;

  tetromino = {
    name,
    matrix,
    column,
    row,
  };
}

function getRandomName() {
  const index = Math.floor(Math.random() * TETROMINO_NAMES.length);
  return TETROMINO_NAMES[index];
}

generatePlayField();
generateTetromino(getRandomName());

const cells = document.querySelectorAll(".tetris div");

function drawPlayField() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      // if(playfield[row][column] == 0) { continue };
      const name = playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetromino.name;
  const tetrominoMatrixSize = tetromino.matrix.length;

  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (tetromino.matrix[row][column] == 0) {
        continue;
      }

      const cellIndex = convertPositionToIndex(
        tetromino.row + row,
        tetromino.column + column
      );
      cells[cellIndex].classList.add(name);
    }
  }
}

drawTetromino();

function draw() {
  cells.forEach(function (cell) {
    cell.removeAttribute("class");
  });
  drawPlayField();
  drawTetromino();
}

document.addEventListener("keydown", onKeyDown);

function onKeyDown(e) {
  switch (e.key) {
    case "ArrowDown":
      moveTetrominoDown();
      break;
    case "ArrowLeft":
      moveTetrominoLeft();
      break;
    case "ArrowRight":
      moveTetrominoRight();
      break;
    case "ArrowUp":
      rotateTetramino();
      break;
    default:
      break;
  }
  draw();
}

function moveTetrominoDown() {
  tetromino.row += 1;
  if (isValid()) {
    tetromino.row -= 1;
    placeTetromino();
  }
}

function moveTetrominoLeft() {
  tetromino.column -= 1;
  if (isValid()) {
    tetromino.column += 1;
  }
}

function moveTetrominoRight() {
  tetromino.column += 1;
  if (isValid()) {
    tetromino.column -= 1;
  }
}

function rotateTetramino() {
  const matrixSize = tetromino.matrix.length;
  const tempMatrix = JSON.parse(JSON.stringify(tetromino.matrix));

  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      tetromino.matrix[row][column] = tempMatrix[matrixSize - column - 1][row];
    }
  }

  if (isValid()) {
    tetromino.matrix = tempMatrix;
  }
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;
      playfield[tetromino.row + row][tetromino.column + column] = "F";
    }
  }
  const filledRows = findfilledRows();
  removeFilledRows(filledRows);

  generateTetromino(getRandomName());
}

function isOutsideOfGameBoard(row, column) {
  return (
    tetromino.column + column < 0 ||
    tetromino.column + column >= PLAYFIELD_COLUMNS ||
    tetromino.row + row >= playfield.length
  );
}

function isCollisions(row, column) {
  return !!playfield[tetromino.row + row][tetromino.column + column];
}

function isValid() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (tetromino.matrix[row][column] === 0) {
        continue;
      }
      if (isOutsideOfGameBoard(row, column)) {
        return true;
      }
      if (isCollisions(row, column)) {
        return true;
      }
    }
  }
}

function findfilledRows() {
  const filledRows = [];
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    let filledColumns = 0;
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (playfield[row][column] !== 0) {
        filledColumns++;
      }
    }
    if (filledColumns === PLAYFIELD_COLUMNS) {
      filledRows.push(row);
    }
  }
  return filledRows;
}

function removeFilledRows(filledRows) {
  filledRows.forEach((row) => {
    playfield[row].forEach((cell, idx) => {
      playfield[row][idx] = "D";
    });

    function clear(timerId) {
      clearTimeout(timerId);
    }

    const timerId = setTimeout(() => {
      dropRowsAbove(row);
      draw();
      clear(timerId);
    }, 500);
  });
}

function dropRowsAbove(rowToDelete) {
  for (let row = rowToDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }

  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}
