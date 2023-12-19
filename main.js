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

const convertPositionToIndex = (row, column) => {
  return row * PLAYFIELD_COLUMNS + column;
};

const generatePlayField = () => {
  for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
    const div = document.createElement("div");
    document.querySelector(".tetris").append(div);
  }

  playfield = new Array(PLAYFIELD_ROWS)
    .fill(0)
    .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
};

const generateTetromino = (name) => {
  const matrix = TETROMINOES[name];

  const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
  const row = 0;

  tetromino = {
    name,
    matrix,
    column,
    row,
  };
};

function getRandomName() {
  const index = Math.floor(Math.random() * TETROMINO_NAMES.length);
  return TETROMINO_NAMES[index];
}

generatePlayField();
generateTetromino(getRandomName());

const cells = document.querySelectorAll(".tetris div");

const drawTetromino = () => {
  const { name, matrix, row, column } = tetromino;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix.length; c++) {
      if (tetromino.matrix[r][c] === 0) {
        continue;
      }

      const cellIndex = convertPositionToIndex(row + r, column + c);
      cells[cellIndex].classList.add(name);
    }
  }
};

drawTetromino();

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

    default:
      break;
  }
}

function moveTetrominoDown() {
  console.log(tetromino.row);
  if (!isOutside()) {
    tetromino.row += 1;
    cells.forEach((cell) => cell.removeAttribute("class"));
    drawTetromino();
  }
}

function moveTetrominoLeft() {
  if (!isOutside()) {
    tetromino.column -= 1;
    if (tetromino.column === -1) tetromino.column += 1;
    cells.forEach((cell) => cell.removeAttribute("class"));
    drawTetromino();
  }
}

function moveTetrominoRight() {
  if (!isOutside()) {
    tetromino.column += 1;
    if (tetromino.column === PLAYFIELD_COLUMNS - tetromino.matrix.length + 1)
      tetromino.column -= 1;
    cells.forEach((cell) => cell.removeAttribute("class"));
    drawTetromino();
  }
}

function isOutside() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) {
        continue;
      }
      if (
        tetromino.column + column < 0 ||
        tetromino.column + column >= PLAYFIELD_COLUMNS ||
        tetromino.row + row >= playfield.length - 1
      ) {
        return true;
      }
    }
  }
  return false;
}

function placeTetromino() {
  const matrixSize = tetromino.matrix.length;
  for (let row = 0; row < matrixSize; row++) {
    for (let column = 0; column < matrixSize; column++) {
      if (!tetromino.matrix[row][column]) continue;

      playfield[tetromino.row + row][tetromino.column + column];
    }
    generateTetromino();
  }
}
