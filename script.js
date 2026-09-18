"use strict";

const SIZE = 5;
const CELL_COUNT = SIZE * SIZE;
const boardElement = document.getElementById("board");
const movesElement = document.getElementById("moves");
const remainingElement = document.getElementById("remaining");
const statusElement = document.getElementById("status");
let board = [];
let initialBoard = [];
let moves = 0;
let cleared = false;

// Check row and column independently so an edge never wraps to another row.
function toggleCross(state, index) {
  const row = Math.floor(index / SIZE);
  const column = index % SIZE;
  for (const [dr, dc] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const r = row + dr;
    const c = column + dc;
    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
      state[r * SIZE + c] = !state[r * SIZE + c];
    }
  }
}

function generatePuzzle(previous) {
  const puzzle = Array(CELL_COUNT).fill(false);
  for (let index = 0; index < CELL_COUNT; index++) {
    if (Math.random() < 0.5) toggleCross(puzzle, index);
  }
  // Applying legal moves to an empty board always produces a solvable puzzle.
  // A deterministic fallback also handles an empty or repeated random result.
  if (!puzzle.some(Boolean) || puzzle.every((value, index) => value === previous[index])) {
    for (let index = 0; index < CELL_COUNT; index++) {
      puzzle.fill(false);
      toggleCross(puzzle, index);
      if (!puzzle.every((value, i) => value === previous[i])) break;
    }
  }
  return puzzle;
}

const cells = Array.from({ length: CELL_COUNT }, (_, index) => {
  const cell = document.createElement("button");
  cell.type = "button";
  cell.className = "cell";
  cell.addEventListener("click", () => play(index));
  boardElement.appendChild(cell);
  return cell;
});

function render(message) {
  cells.forEach((cell, index) => {
    cell.classList.toggle("is-on", board[index]);
    cell.setAttribute("aria-pressed", String(board[index]));
    cell.setAttribute("aria-label", `${Math.floor(index / SIZE) + 1}行${index % SIZE + 1}列：${board[index] ? "点灯" : "消灯"}`);
    cell.setAttribute("aria-disabled", String(cleared));
  });
  movesElement.textContent = String(moves);
  remainingElement.textContent = String(board.filter(Boolean).length);
  statusElement.classList.toggle("is-clear", cleared);
  statusElement.textContent = message;
}

function play(index) {
  if (cleared) return;
  toggleCross(board, index);
  moves++;
  cleared = !board.some(Boolean);
  render(cleared ? `クリア！ ${moves}手ですべての光が消えました。` : "すべての光を消してみよう。");
}

function resetPuzzle() {
  board = initialBoard.slice();
  moves = 0;
  cleared = false;
  render("最初の状態に戻しました。もう一度！");
}

function newPuzzle() {
  initialBoard = generatePuzzle(initialBoard);
  board = initialBoard.slice();
  moves = 0;
  cleared = false;
  render("光をタップして、スタート。");
}

document.getElementById("reset").addEventListener("click", resetPuzzle);
document.getElementById("new-game").addEventListener("click", newPuzzle);
newPuzzle();

// ページ読み込みごとに1回だけ記録し、応答待ちや再試行はしない。
try {
  fetch("https://script.google.com/macros/s/AKfycbxssCIHsD-N97SHxNC_GN0ihYeC0qy-lb-EY0KmSs6Gnztaph1sITMerLVEnNWOGkYc/exec?app=lights-out", {
    method: "GET",
    mode: "no-cors",
    cache: "no-store",
    credentials: "omit",
    keepalive: true,
  }).catch(() => {});
} catch {
  // アクセス記録の失敗でゲームを中断しない。
}
