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
let intervalId;
let level = 1;
let delay = 1000;
let isPaused = true;

const levelElement = document.querySelector(".level");

const scoreElement = document.querySelector(".score");
let score = parseInt(scoreElement.innerHTML);

const startButton = document.querySelector("#start");
const pauseButton = document.querySelector("#pause");
pauseButton.disabled = true;

const modal = document.querySelector(".modal");

const result = document.querySelector("#result");

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
  if (!isGameOver()) {
    drawTetromino();
  } else {
    clearTimeout(intervalId);
    result.textContent = score;
    modal.style.display = "block";
    startButton.disabled = false;
    pauseButton.disabled = true;
  }
}

document.addEventListener("keydown", onKeyDown);

function onKeyDown(e) {
  if (isPaused) {
    return;
  }

  switch (e.key) {
    case " ":
      dropTetromino();
      break;
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
    case "Escape":
      !isPaused && pause();
      break;
    default:
      break;
  }

  draw();
}

function dropTetromino() {
  while (!isValid()) {
    tetromino.row++;
  }
  tetromino.row--;
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
    playfield[row].forEach((_cell, idx) => {
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
  filledRows.length && updateScore(filledRows.length);
}

function dropRowsAbove(rowToDelete) {
  for (let row = rowToDelete; row > 0; row--) {
    playfield[row] = playfield[row - 1];
  }

  playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);
}

function updateScore(rowQty) {
  switch (rowQty) {
    case 1:
      score += 10;
      break;
    case 2:
      score += 30;
      break;
    case 3:
      score += 50;
      break;
    case 4:
      score += 100;
      break;
    default:
      break;
  }
  setLevel();
  scoreElement.textContent = score;
}

function start() {
  if (isGameOver()) {
    window.location.reload();
  }
  intervalId = setInterval(() => {
    moveTetrominoDown();
    draw();
  }, delay);
  isPaused = false;
  startButton.disabled = true;
  pauseButton.disabled = false;
}

function pause() {
  clearInterval(intervalId);
  isPaused = true;
  startButton.disabled = false;
  pauseButton.disabled = true;
}

function isGameOver() {
  let filledCells = [];
  for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
    if (playfield[1][column] !== 0) {
      filledCells.push(playfield[0][column]);
    }
  }
  return !!filledCells.length;
}

function setLevel() {
  switch (true) {
    case score >= 1000 && score < 5000:
      level = 2;
      changeDelay(800);
      break;
    case score >= 5000 && score < 10000:
      level = 3;
      changeDelay(600);
      break;
    case score >= 10000 && score < 20000:
      level = 4;
      changeDelay(400);
      break;
    case score >= 20000 && score < 50000:
      level = 5;
      changeDelay(200);
      break;
    case score >= 50000:
      level = 6;
      changeDelay(100);
      break;
    default:
      break;
  }
  levelElement.textContent = level;
}

function changeDelay(newDelay) {
  delay = newDelay;
  clearTimeout(intervalId);
  intervalId = setInterval(() => {
    moveTetrominoDown();
    draw();
  }, delay);
}

function restart() {
  window.location.reload();
}
