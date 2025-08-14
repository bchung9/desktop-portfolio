let dragInfo = {};
let highestZ = 1;

function openWindow(id) {
  document.getElementById('snd-open').play();
  const w = document.getElementById(id);

  // Universal size and centering for all windows
  const winWidth = 500;
  const winHeight = 500;
  const left = (window.innerWidth - winWidth) / 2;
  const top = (window.innerHeight - winHeight) / 2;

  w.style.width = winWidth + 'px';
  w.style.height = winHeight + 'px';
  w.style.left = left + 'px';
  w.style.top = top + 'px';

  w.style.display = 'block';
  w.style.zIndex = ++highestZ;
}


function closeWindow(id) {
  document.getElementById('snd-close').play();
  document.getElementById(id).style.display = 'none';

  const taskbarBtn = document.getElementById(`tb-${id}`);
  if (taskbarBtn) {
    taskbarBtn.remove();
  }
}

function startDrag(e, id) {
  dragInfo[id] = {
    startX: e.clientX,
    startY: e.clientY,
    el: document.getElementById(id),
    origX: parseInt(window.getComputedStyle(document.getElementById(id)).left),
    origY: parseInt(window.getComputedStyle(document.getElementById(id)).top)
  };
  dragInfo.current = id;
  document.addEventListener('mousemove', doDrag);
  document.addEventListener('mouseup', stopDrag);
  dragInfo.el.style.zIndex = ++highestZ;
}

function doDrag(e) {
  const info = dragInfo[dragInfo.current];
  if (!info) return;
  info.el.style.left = info.origX + (e.clientX - info.startX) + 'px';
  info.el.style.top = info.origY + (e.clientY - info.startY) + 'px';
}

function stopDrag() {
  document.removeEventListener('mousemove', doDrag);
  document.removeEventListener('mouseup', stopDrag);
  dragInfo.current = null;
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const tzString = now.toLocaleTimeString('en-US', { timeZoneName: 'short' });
  const tzParts = tzString.split(' ');
  const tzAbbr = tzParts[tzParts.length - 1]; // e.g. "PDT" or "EST"

  const clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.innerText = `${time} ${tzAbbr}`;
  }
}

setInterval(updateClock, 1000);
updateClock();

const music = document.getElementById('bg-music');
const playBtn = document.querySelector('#now-playing button');

function toggleMusic() {
  if (music.paused) {
    music.play();
    playBtn.textContent = '⏸';
  } else {
    music.pause();
    playBtn.textContent = '▶️';
  }
}
function setVolume(val) {
  music.volume = val;
}
music.volume = 0.5;

function startExperience() {
  document.getElementById('splash').style.opacity = '0';
  setTimeout(() => {
    document.getElementById('splash').style.display = 'none';
    music.play();
    playBtn.textContent = '⏸';

    const desktop = document.getElementById('desktop');
    desktop.classList.remove('hidden-icons');
    setTimeout(() => {
      desktop.classList.add('show-icons');
    }, 100);
  }, 500);
}

window.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progress-bar');
  const enterBtn = document.getElementById('enter-btn');
  const loadingText = document.getElementById('loading-text');

  let percent = 0;
  const duration = 2000;
  const interval = 20;
  const steps = duration / interval;
  const increment = 100 / steps;

  const progressInterval = setInterval(() => {
    percent += increment;
    if (percent >= 100) {
      percent = 100;
      clearInterval(progressInterval);
      enterBtn.disabled = false;
    }
    loadingText.textContent = `Loading... ${Math.floor(percent)}%`;
    progressBar.style.width = `${percent}%`;
  }, interval);
});

function shutdownSystem() {
  music.pause();
  const shutdownSound = document.getElementById('shutdown-sound');
  if (shutdownSound) shutdownSound.volume = 0.2;
  shutdownSound?.play();
  document.getElementById('blackout').style.opacity = '1';
}

function minimizeWindow(id) {
  const w = document.getElementById(id);
  w.style.display = 'none';

  const taskbar = document.getElementById('taskbar-apps');
  if (!document.getElementById(`tb-${id}`)) {
    const btn = document.createElement('button');
    btn.id = `tb-${id}`;
    btn.classList.add('taskbar-icon');
    btn.title = id.charAt(0).toUpperCase() + id.slice(1); // tooltip text

    // Match icon with corresponding window
    const desktopIcon = document.querySelector(`.icon[ondblclick*="${id}"] img`);
    const iconImg = document.createElement('img');
    iconImg.src = desktopIcon ? desktopIcon.src : '';
    btn.appendChild(iconImg);

    btn.onclick = () => restoreWindow(id);
    taskbar.appendChild(btn);
  }
}


function restoreWindow(id) {
  const w = document.getElementById(id);
  w.style.display = 'block';
  w.style.zIndex = ++highestZ;
}

let windowState = {}; // store original sizes/positions

function maximizeWindow(id) {
  const w = document.getElementById(id);

  if (w.classList.contains('maximized')) {
    // Unmaximize: restore original position & size
    w.classList.remove('maximized');
    if (windowState[id]) {
      w.style.top = windowState[id].top;
      w.style.left = windowState[id].left;
      w.style.width = windowState[id].width;
      w.style.height = windowState[id].height;
    }
  } else {
    // Save current size & position
    windowState[id] = {
      top: w.style.top,
      left: w.style.left,
      width: w.style.width,
      height: w.style.height
    };

    // Maximize to fill screen
    w.classList.add('maximized');
    w.style.top = '0';
    w.style.left = '0';
    w.style.width = '100vw';
    w.style.height = 'calc(100vh - 65px)'; // leaves room for taskbar
  }
}

function copyEmail() {
  const email = document.getElementById('email-text').innerText;
  navigator.clipboard.writeText(email).then(() => {
    alert('Email copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy email.');
  });
}

// --- Paint App (guarded) ---
const canvas = document.getElementById('paint-canvas');
let ctx = null;
let painting = false;

if (canvas) {
  ctx = canvas.getContext('2d');

  function startPosition(e) {
    painting = true;
    draw(e);
  }
  function endPosition() {
    painting = false;
    ctx.beginPath();
  }
  function draw(e) {
    if (!painting) return;

    const colorInput = document.getElementById('paint-color');
    const sizeInput = document.getElementById('paint-size');
    const color = colorInput ? colorInput.value : '#000';
    const size = sizeInput ? sizeInput.value : 5;

    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseleave', endPosition);

  window.clearCanvas = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
} else {
  // no-op so buttons referencing clearCanvas won't explode
  window.clearCanvas = function () {};
}

// --- Basic Calculator (guarded) ---
const calcDisplay = document.getElementById("calc-display");
const calcButtonsContainer = document.querySelector(".calc-buttons");
let calcExpression = "";

if (calcDisplay && calcButtonsContainer) {
  const buttonLayout = [
    ['CLEAR', 'DEL', '', ''],
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+']
  ];

  function updateCalcDisplay() {
    calcDisplay.value = calcExpression;
  }

  buttonLayout.forEach(row => {
    row.forEach(btn => {
      if (btn === '') {
        const spacer = document.createElement("div");
        calcButtonsContainer.appendChild(spacer);
        return;
      }
      const b = document.createElement("button");
      b.textContent = btn;

      if (btn === 'CLEAR' || btn === 'DEL') {
        b.style.background = "#777";
        b.style.color = "white";
      } else if (btn === '=') {
        b.style.background = "orange";
        b.style.color = "white";
      } else {
        b.style.background = "#2196F3";
        b.style.color = "white";
      }

      b.onclick = () => {
        if (btn === 'CLEAR') {
          calcExpression = "";
        } else if (btn === 'DEL') {
          calcExpression = calcExpression.slice(0, -1);
        } else if (btn === '=') {
          try {
            // NOTE: only evaluating user-typed digits/operators from our buttons
            calcExpression = String(Function(`"use strict";return (${calcExpression})`)());
          } catch {
            calcExpression = "Error";
          }
        } else {
          calcExpression += btn;
        }
        updateCalcDisplay();
      };

      calcButtonsContainer.appendChild(b);
    });
  });
}

// Dino Game
let isJumping = false;
let score = 0;
let gameOver = false;
let cactusSpeed = 3;

const dinoEl = document.getElementById("dino");
const cactusEl = document.getElementById("cactus");
const scoreEl = document.querySelector(".dino-score");
const gameContainer = document.getElementById("game-container");

function jump() {
  if (!isJumping && !gameOver) {
    isJumping = true;
    dinoEl.classList.add("jump");
    setTimeout(() => {
      dinoEl.classList.remove("jump");
      isJumping = false;
    }, 500);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameOver) restartGame();
    else jump();
  }
});

function moveCactus() {
  if (gameOver) return;

  let cactusPos = parseInt(window.getComputedStyle(cactusEl).right);
  cactusEl.style.right = (cactusPos + cactusSpeed) + "px";

  if (cactusPos > gameContainer.offsetWidth) {
    cactusEl.style.right = "-40px";
    score++;
    scoreEl.textContent = score;
    cactusSpeed += 0.05; // gradually increase speed
  }

  const dinoRect = dinoEl.getBoundingClientRect();
  const cactusRect = cactusEl.getBoundingClientRect();

  if (
    dinoRect.right > cactusRect.left &&
    dinoRect.left < cactusRect.right &&
    dinoRect.bottom > cactusRect.top
  ) {
    endGame();
  }

  requestAnimationFrame(moveCactus);
}

function endGame() {
  gameOver = true;
  const overlay = document.createElement("div");
  overlay.className = "dino-over";
  overlay.innerHTML = `Game Over!<br>Score: ${score}<br><small>Press Space to Restart</small>`;
  gameContainer.appendChild(overlay);
}

function restartGame() {
  gameOver = false;
  score = 0;
  scoreEl.textContent = score;
  cactusSpeed = 3;
  cactusEl.style.right = "-40px";
  const overlay = document.querySelector(".dino-over");
  if (overlay) overlay.remove();
  requestAnimationFrame(moveCactus);
}

requestAnimationFrame(moveCactus);
