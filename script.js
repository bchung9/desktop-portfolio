let dragInfo = {};
let highestZ = 1;

function openWindow(id) {
  playClickSound();
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

  if (id === "dino-game") {
    initDinoGame();
  }
}

function closeWindow(id) {
  playClickSound();
  document.getElementById(id).style.display = 'none';

  const taskbarBtn = document.getElementById(`tb-${id}`);
  if (taskbarBtn) {
    taskbarBtn.remove();
  }

  if (id === "dino-game") {
    gameOver = true;
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
  const tzAbbr = tzParts[tzParts.length - 1];

  const clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.innerText = `${time} ${tzAbbr}`;
  }
}

setInterval(updateClock, 1000);
updateClock();

const music = document.getElementById('bg-music');
const playBtn = document.querySelector('#now-playing button');
const volumeSlider = document.getElementById('volume');

music.volume = 0.05;

if (volumeSlider) {
  volumeSlider.value = music.volume;
}

function toggleMusic() {
  playClickSound();
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
  playClickSound();
  const w = document.getElementById(id);
  w.style.display = 'none';

  const taskbar = document.getElementById('taskbar-apps');
  if (!document.getElementById(`tb-${id}`)) {
    const btn = document.createElement('button');
    btn.id = `tb-${id}`;
    btn.classList.add('taskbar-icon');
    btn.title = id.charAt(0).toUpperCase() + id.slice(1);

    const desktopIcon = document.querySelector(`.icon[ondblclick*="${id}"] img`);
    const iconImg = document.createElement('img');
    iconImg.src = desktopIcon ? desktopIcon.src : '';
    btn.appendChild(iconImg);

    btn.onclick = () => {
      playClickSound();
      restoreWindow(id);
    };
    taskbar.appendChild(btn);
  }
}

function restoreWindow(id) {
  const w = document.getElementById(id);
  w.style.display = 'block';
  w.style.zIndex = ++highestZ;
}

let windowState = {};

function maximizeWindow(id) {
  playClickSound();
  const w = document.getElementById(id);

  if (w.classList.contains('maximized')) {
    w.classList.remove('maximized');
    if (windowState[id]) {
      w.style.top = windowState[id].top;
      w.style.left = windowState[id].left;
      w.style.width = windowState[id].width;
      w.style.height = windowState[id].height;
    }
  } else {
    windowState[id] = {
      top: w.style.top,
      left: w.style.left,
      width: w.style.width,
      height: w.style.height
    };

    w.classList.add('maximized');
    w.style.top = '0';
    w.style.left = '0';
    w.style.width = '100vw';
    w.style.height = 'calc(100vh - 65px)';
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

// Dino Game
let isJumping = false;
let score = 0;
let gameOver = false;
let cactusSpeed = 2;

const jumpSound = new Audio("sounds/jump.mp3");
const pointSound = new Audio("sounds/point.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");

jumpSound.volume = 0.5;
pointSound.volume = 0.4;
gameOverSound.volume = 0.5;

const dinoEl = document.getElementById("dino");
const cactusEl = document.getElementById("cactus");
const scoreEl = document.querySelector(".dino-score");
const gameContainer = document.getElementById("game-container");

function jump() {
  if (!isJumping && !gameOver) {
    isJumping = true;
    jumpSound.currentTime = 0;
    jumpSound.play();
    dinoEl.classList.add("jump");
    setTimeout(() => {
      dinoEl.classList.remove("jump");
      isJumping = false;
    }, 500);
  }
}

document.addEventListener("keydown", function(e) {
  if (e.code === "Space") {
    const dinoWin = document.getElementById("dino-game");

    if (dinoWin && dinoWin.style.display === "block") {
      if (gameOver) {
        initDinoGame();
      } else {
        jump();
      }
    }
  }
});

gameContainer.addEventListener("click", function() {
  const dinoWin = document.getElementById("dino-game");

  if (dinoWin && dinoWin.style.display === "block") {
    if (gameOver) {
      initDinoGame();
    } else {
      jump();
    }
  }
});

gameContainer.addEventListener("touchstart", function(e) {
  e.preventDefault();
  const dinoWin = document.getElementById("dino-game");

  if (dinoWin && dinoWin.style.display === "block") {
    if (gameOver) {
      initDinoGame();
    } else {
      jump();
    }
  }
}, { passive: false });


function moveCactus() {
  if (gameOver) return;

  let cactusPos = parseInt(window.getComputedStyle(cactusEl).right);
  cactusEl.style.right = (cactusPos + cactusSpeed) + "px";

  if (cactusPos > gameContainer.offsetWidth) {
  cactusEl.style.right = "-40px";
  score++;
  scoreEl.textContent = score;
  pointSound.currentTime = 0;
  pointSound.play();
  cactusSpeed += 0.1;
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
  gameOverSound.currentTime = 0;
  gameOverSound.play();
  const overlay = document.createElement("div");
  overlay.className = "dino-over";
  overlay.innerHTML = `Game Over!<br>Score: ${score}<br><small>Press Space (or Tap the Screen) to Restart</small>`;
  gameContainer.appendChild(overlay);
}

function initDinoGame() {
  gameOver = false;
  score = 0;
  scoreEl.textContent = score;
  cactusSpeed = 2;
  cactusEl.style.right = "-40px";

  const overlay = document.querySelector(".dino-over");
  if (overlay) overlay.remove();

  requestAnimationFrame(moveCactus);
}

function playClickSound() {
  const clickSound = document.getElementById('click');
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
}
