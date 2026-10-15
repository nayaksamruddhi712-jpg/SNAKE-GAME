/* Snake Game – vanilla ES6+ ----------------------------------------------- */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

const CELL = 20;                     // size of one grid cell (px)
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const STEP = 1000 / 10;              // 10 updates per second

let snake, dir, nextDir, food, score;
let running = false, gameOver = false;
let lastTime = 0, accumulator = 0;

/* ---------- Helpers ------------------------------------------------------ */
const toKey = (x, y) => `${x}:${y}`;
const getVar = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------- Game Setup --------------------------------------------------- */
function reset() {
  snake = [{ x: 8, y: 8 }];          // centre of a 20×20 board
  dir = { x: 1, y: 0 };
  nextDir = dir;
  placeFood();
  score = 0;
  running = true;
  gameOver = false;
  scoreEl.textContent = `Score: ${score}`;
  canvas.classList.remove('game-over');
}

/* ---------- Food ---------------------------------------------------------- */
function placeFood() {
  const occupied = new Set(snake.map(p => toKey(p.x, p.y)));
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  } while (occupied.has(toKey(food.x, food.y)));
}

/* ---------- Input --------------------------------------------------------- */
window.addEventListener('keydown', e => {
  const map = {
    ArrowUp:    { x: 0, y: -1 }, ArrowDown:  { x: 0, y: 1 },
    ArrowLeft:  { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
    a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
  };
  const dirCandidate = map[e.key];
  if (dirCandidate) {
    // block 180° turn
    if (dirCandidate.x !== -dir.x || dirCandidate.y !== -dir.y) nextDir = dirCandidate;
  } else if (gameOver && (e.key === 'Enter' || e.key === ' ')) {
    reset();
  }
});

/* ---------- Game Logic --------------------------------------------------- */
function endGame() {
  running = false;
  gameOver = true;
  canvas.classList.add('game-over');
}

function update() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return endGame();
  // self collision
  if (snake.some(p => p.x === head.x && p.y === head.y)) return endGame();

  snake.unshift(head); // new head

  // food?
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    scoreEl.classList.add('bump');
    setTimeout(() => scoreEl.classList.remove('bump'), 150);
    placeFood();
  } else {
    snake.pop(); // remove tail
  }
}

/* ---------- Rendering ---------------------------------------------------- */
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // food
  ctx.fillStyle = getVar('--food');
  ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

  // snake
  ctx.fillStyle = getVar('--snake');
  snake.forEach(p => ctx.fillRect(p.x * CELL, p.y * CELL, CELL, CELL));
}

/* ---------- Main Loop ---------------------------------------------------- */
function loop(timestamp) {
  if (!running && !gameOver) { // first frame after reset
    lastTime = timestamp;
    requestAnimationFrame(loop);
    return;
  }

  accumulator += timestamp - lastTime;
  lastTime = timestamp;

  while (accumulator >= STEP) {
    update();
    accumulator -= STEP;
  }

  render();
  requestAnimationFrame(loop);
}

/* ---------- Start -------------------------------------------------------- */
reset();
requestAnimationFrame(loop);