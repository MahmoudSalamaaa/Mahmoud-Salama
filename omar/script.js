/* ========== STARFIELD BACKGROUND ========== */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [];
let w, h;

function initStars() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            z: Math.random() * w,
        });
    }
}
initStars();
window.addEventListener("resize", initStars);

function drawStars() {
    ctx.fillStyle = "rgba(10, 15, 40, 0.8)";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= 0.5;
        if (s.z <= 0) s.z = w;
        const k = 128.0 / s.z;
        const px = s.x * k + w / 2;
        const py = s.y * k + h / 2;
        if (px >= 0 && px <= w && py >= 0 && py <= h) {
            const size = (1 - s.z / w) * 2;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, ${200 + Math.random() * 55}, 0.8)`;
            ctx.fill();
        }
    }
    requestAnimationFrame(drawStars);
}
drawStars();

/* ========== PRELOADER ========== */
window.addEventListener("load", () => {
    setTimeout(() => {
        const preloader = document.getElementById("preloader");
        if (preloader) preloader.classList.add("hidden");
    }, 1200);
});

/* ========== BACK TO TOP BUTTON ========== */
const backToTop = document.getElementById("backToTop");
if (backToTop) {
    window.addEventListener("scroll", () => {
        backToTop.style.display = window.scrollY > 400 ? "block" : "none";
    });
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

/* ========== GALLERY LIGHTBOX ========== */
const galleryImgs = document.querySelectorAll(".gallery-img");
const lightbox = document.createElement("div");
lightbox.id = "lightbox";
document.body.appendChild(lightbox);

galleryImgs.forEach((img) => {
    img.addEventListener("click", () => {
        lightbox.classList.add("active");
        const fullImg = document.createElement("img");
        fullImg.src = img.src;
        while (lightbox.firstChild) lightbox.removeChild(lightbox.firstChild);
        lightbox.appendChild(fullImg);
    });
});
lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
});

/* Inject Lightbox CSS */
const style = document.createElement("style");
style.textContent = `
  #lightbox {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.9);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  #lightbox.active { display: flex; }
  #lightbox img {
    max-width: 90%; max-height: 80%;
    border-radius: 10px;
    box-shadow: 0 0 25px rgba(255,255,255,0.3);
  }
`;
document.head.appendChild(style);

/* ========== GAMES BASE SETUP ========== */
const asteroidGameContainer = document.getElementById("asteroidGame");
const starCollectorContainer = document.getElementById("starCollectorGame");

const asteroidGameCanvas = document.createElement("canvas");
const starCollectorCanvas = document.createElement("canvas");

asteroidGameCanvas.className = "game-canvas";
starCollectorCanvas.className = "game-canvas";

if (asteroidGameContainer) asteroidGameContainer.appendChild(asteroidGameCanvas);
if (starCollectorContainer) starCollectorContainer.appendChild(starCollectorCanvas);

const ctxA = asteroidGameCanvas.getContext("2d");
const ctxS = starCollectorCanvas.getContext("2d");

function resizeGames() {
    const widthA = asteroidGameContainer
        ? asteroidGameContainer.clientWidth
        : window.innerWidth * 0.8;
    const widthS = starCollectorContainer
        ? starCollectorContainer.clientWidth
        : window.innerWidth * 0.8;

    asteroidGameCanvas.width = widthA;
    starCollectorCanvas.width = widthS;

    asteroidGameCanvas.height = 220;
    starCollectorCanvas.height = 220;

    // recenter players on resize
    playerA.reset();
    playerS.reset();
}
window.addEventListener("resize", resizeGames);

/* Shared Player Class */
class Player {
    constructor(ctx, color) {
        this.ctx = ctx;
        this.color = color;
        this.reset();
    }
    reset() {
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height - 35;
    }
    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x - 15, this.y + 30);
        this.ctx.lineTo(this.x + 15, this.y + 30);
        this.ctx.closePath();
        this.ctx.fill();
    }
    move(dir) {
        this.x += dir * 12;
        if (this.x < 20) this.x = 20;
        if (this.x > this.ctx.canvas.width - 20)
            this.x = this.ctx.canvas.width - 20;
    }
}

const playerA = new Player(ctxA, "#4f8aff");
const playerS = new Player(ctxS, "#fcd34d");

resizeGames();

/* ========== DIFFICULTY CONFIGURATIONS ========== */
const ASTEROID_LEVELS = {
    easy: { spawnRate: 0.02, speed: 2.0, lives: 7 },
    normal: { spawnRate: 0.03, speed: 2.5, lives: 5 },
    hard: { spawnRate: 0.045, speed: 3.5, lives: 3 },
};
let asteroidLevel = "easy";
let asteroidConfig = ASTEROID_LEVELS[asteroidLevel];

function setAsteroidDifficulty(level) {
    asteroidLevel = level;
    asteroidConfig = ASTEROID_LEVELS[level];
}

const STAR_LEVELS = {
    easy: { starSpawn: 0.09, asteroidSpawn: 0.015, starSpeed: 1.6, asteroidSpeed: 2.5, winScore: 40, penalty: 1 },
    normal: { starSpawn: 0.07, asteroidSpawn: 0.02, starSpeed: 1.8, asteroidSpeed: 2.8, winScore: 50, penalty: 2 },
    hard: { starSpawn: 0.06, asteroidSpawn: 0.03, starSpeed: 2.2, asteroidSpeed: 3.2, winScore: 70, penalty: 3 },
};
let starLevel = "easy";
let starConfig = STAR_LEVELS[starLevel];

function setStarDifficulty(level) {
    starLevel = level;
    starConfig = STAR_LEVELS[level];
}

/* Helper to create difficulty buttons */
function createDifficultyButtons(container, onChange, defaultLevel) {
    if (!container) return;
    const wrapper = document.createElement("div");
    wrapper.className = "difficulty-controls mt-2";
    wrapper.innerHTML = `
        <span class="me-2 fw-bold text-light small">Difficulty:</span>
        <button class="btn btn-sm btn-outline-gold me-1" data-level="easy">Easy</button>
        <button class="btn btn-sm btn-outline-gold me-1" data-level="normal">Normal</button>
        <button class="btn btn-sm btn-outline-gold" data-level="hard">Hard</button>
    `;
    container.appendChild(wrapper);

    const buttons = wrapper.querySelectorAll("button[data-level]");
    buttons.forEach((btn) => {
        if (btn.dataset.level === defaultLevel) btn.classList.add("active");
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            onChange(btn.dataset.level);
        });
    });
}

createDifficultyButtons(asteroidGameContainer, setAsteroidDifficulty, asteroidLevel);
createDifficultyButtons(starCollectorContainer, setStarDifficulty, starLevel);

/* ========== ASTEROID GAME (DODGE) ========== */
let asteroids = [];
let lives = asteroidConfig.lives;
let scoreA = 0;
let runningA = false;

function startAsteroids() {
    // stop star game so only one runs at a time
    runningS = false;

    if (runningA) return;
    asteroids = [];
    lives = asteroidConfig.lives;
    scoreA = 0;
    playerA.reset();
    runningA = true;
    gameLoopA();
}

function gameLoopA() {
    if (!runningA) return;

    ctxA.clearRect(0, 0, ctxA.canvas.width, ctxA.canvas.height);
    ctxA.fillStyle = "rgba(10,15,40,0.9)";
    ctxA.fillRect(0, 0, ctxA.canvas.width, ctxA.canvas.height);

    playerA.draw();

    if (Math.random() < asteroidConfig.spawnRate) {
        asteroids.push({
            x: Math.random() * ctxA.canvas.width,
            y: -20,
            r: 10 + Math.random() * 10,
        });
    }

    ctxA.fillStyle = "#aaa";
    asteroids.forEach((a) => {
        a.y += asteroidConfig.speed;
        ctxA.beginPath();
        ctxA.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctxA.fill();
    });

    asteroids = asteroids.filter((a) => {
        const d = Math.hypot(a.x - playerA.x, a.y - playerA.y);

        if (d < a.r + 12) {
            lives--;
            if (lives <= 0) {
                runningA = false;
                alert(`💥 Game Over! Score: ${scoreA}`);
            }
            return false;
        }

        if (a.y > ctxA.canvas.height) {
            scoreA++;
            return false;
        }
        return true;
    });

    ctxA.fillStyle = "#fcd34d";
    ctxA.font = "16px Inter";
    ctxA.fillText(`Lives: ${lives} | Score: ${scoreA}`, 10, 22);
    ctxA.fillText(`Use ⬅️ ➡️ or mouse to move`, 10, 42);

    requestAnimationFrame(gameLoopA);
}

/* ========== STAR COLLECTOR GAME ========== */
let starsArr = [];
let asteroidsS = [];
let scoreS = 0;
let collected = 0;
let runningS = false;

function startStars() {
    // stop asteroid game so only one runs at a time
    runningA = false;

    if (runningS) return;
    starsArr = [];
    asteroidsS = [];
    scoreS = 0;
    collected = 0;
    playerS.reset();
    runningS = true;
    gameLoopS();
}

function gameLoopS() {
    if (!runningS) return;

    ctxS.clearRect(0, 0, ctxS.canvas.width, ctxS.canvas.height);
    ctxS.fillStyle = "rgba(10,15,40,0.9)";
    ctxS.fillRect(0, 0, ctxS.canvas.width, ctxS.canvas.height);

    playerS.draw();

    if (Math.random() < starConfig.starSpawn) {
        starsArr.push({
            x: Math.random() * ctxS.canvas.width,
            y: -20,
            r: 8,
            color: "#ffd84b",
        });
    }
    if (Math.random() < starConfig.asteroidSpawn) {
        asteroidsS.push({
            x: Math.random() * ctxS.canvas.width,
            y: -20,
            r: 10,
            color: "#777",
        });
    }

    [...starsArr, ...asteroidsS].forEach((o) => {
        ctxS.fillStyle = o.color;
        ctxS.beginPath();
        ctxS.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctxS.fill();
        o.y += o.color === "#ffd84b" ? starConfig.starSpeed : starConfig.asteroidSpeed;
    });

    starsArr = starsArr.filter((s) => {
        const d = Math.hypot(s.x - playerS.x, s.y - playerS.y);
        if (d < s.r + 12) {
            scoreS += 5;
            collected++;
            return false;
        }
        return s.y < ctxS.canvas.height;
    });

    asteroidsS = asteroidsS.filter((a) => {
        const d = Math.hypot(a.x - playerS.x, a.y - playerS.y);
        if (d < a.r + 12) {
            scoreS = Math.max(0, scoreS - starConfig.penalty);
            return false;
        }
        return a.y < ctxS.canvas.height;
    });

    ctxS.fillStyle = "#fcd34d";
    ctxS.font = "16px Inter";
    ctxS.fillText(`Score: ${scoreS} | Stars: ${collected}⭐`, 10, 22);
    ctxS.fillText(`Reach ${starConfig.winScore} points to win!`, 10, 42);
    ctxS.fillText(`Use ⬅️ ➡️ or mouse to move`, 10, 62);

    if (scoreS >= starConfig.winScore) {
        runningS = false;
        alert("🌟 You Win! Great Job!");
    } else {
        requestAnimationFrame(gameLoopS);
    }
}

/* ========== KEYBOARD CONTROLS ========== */
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        if (runningA) playerA.move(-1);
        if (runningS) playerS.move(-1);
    }
    if (e.key === "ArrowRight") {
        if (runningA) playerA.move(1);
        if (runningS) playerS.move(1);
    }
});

/* ========== START BUTTONS ========== */
const startAsteroidsBtn = document.getElementById("startAsteroids");
if (startAsteroidsBtn) {
    startAsteroidsBtn.addEventListener("click", startAsteroids);
}

const startStarsBtn = document.getElementById("startStars");
if (startStarsBtn) {
    startStarsBtn.addEventListener("click", startStars);
}

/* ========== ON-SCREEN MOBILE CONTROLS ========== */
function createMobileControls(containerId, player, isAsteroid) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const controlDiv = document.createElement("div");
    controlDiv.className = "mobile-controls mt-2";
    controlDiv.innerHTML = `
        <button class="btn btn-outline-gold me-2">⬅️</button>
        <button class="btn btn-outline-gold">➡️</button>
    `;
    container.appendChild(controlDiv);

    const [leftBtn, rightBtn] = controlDiv.querySelectorAll("button");

    leftBtn.addEventListener("touchstart", () => {
        if (isAsteroid && runningA) player.move(-1);
        if (!isAsteroid && runningS) player.move(-1);
    });
    rightBtn.addEventListener("touchstart", () => {
        if (isAsteroid && runningA) player.move(1);
        if (!isAsteroid && runningS) player.move(1);
    });
}

createMobileControls("asteroidGame", playerA, true);
createMobileControls("starCollectorGame", playerS, false);

/* ========== MOUSE & TOUCH MOVE CONTROLS ========== */
function enableMouseControl(canvas, player, isAsteroidGame) {
    if (!canvas) return;
    canvas.style.cursor = "pointer";

    function setPlayerFromClientX(clientX) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        player.x = Math.min(Math.max(x, 20), canvas.width - 20);
    }

    canvas.addEventListener("mousemove", (e) => {
        if (isAsteroidGame && !runningA) return;
        if (!isAsteroidGame && !runningS) return;
        setPlayerFromClientX(e.clientX);
    });

    canvas.addEventListener("mousedown", (e) => {
        setPlayerFromClientX(e.clientX);
        if (isAsteroidGame) {
            if (!runningA) startAsteroids();
        } else {
            if (!runningS) startStars();
        }
    });

    canvas.addEventListener(
        "touchstart",
        (e) => {
            const touch = e.touches[0];
            setPlayerFromClientX(touch.clientX);
            if (isAsteroidGame) {
                if (!runningA) startAsteroids();
            } else {
                if (!runningS) startStars();
            }
        },
        { passive: true }
    );

    canvas.addEventListener(
        "touchmove",
        (e) => {
            if (isAsteroidGame && !runningA) return;
            if (!isAsteroidGame && !runningS) return;
            const touch = e.touches[0];
            setPlayerFromClientX(touch.clientX);
        },
        { passive: true }
    );
}

enableMouseControl(asteroidGameCanvas, playerA, true);
enableMouseControl(starCollectorCanvas, playerS, false);
