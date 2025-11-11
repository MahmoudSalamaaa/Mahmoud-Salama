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
        document.getElementById("preloader").classList.add("hidden");
    }, 1200);
});

/* ========== BACK TO TOP BUTTON ========== */
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 400 ? "block" : "none";
});
backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

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

/* ========== GAMES ========== */
const asteroidGameCanvas = document.createElement("canvas");
const starCollectorCanvas = document.createElement("canvas");
document.getElementById("asteroidGame").appendChild(asteroidGameCanvas);
document.getElementById("starCollectorGame").appendChild(starCollectorCanvas);

const ctxA = asteroidGameCanvas.getContext("2d");
const ctxS = starCollectorCanvas.getContext("2d");

function resizeGames() {
    asteroidGameCanvas.width = starCollectorCanvas.width = document.querySelector(".game-canvas").offsetWidth;
    asteroidGameCanvas.height = starCollectorCanvas.height = 200;
}
window.addEventListener("resize", resizeGames);
resizeGames();

/* Shared Player Class */
class Player {
    constructor(ctx, color) {
        this.ctx = ctx;
        this.x = ctx.canvas.width / 2;
        this.y = ctx.canvas.height - 25;
        this.color = color;
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
        this.x += dir * 10;
        if (this.x < 20) this.x = 20;
        if (this.x > this.ctx.canvas.width - 20) this.x = this.ctx.canvas.width - 20;
    }
}

/* === Dodge the Asteroids === */
let asteroids = [], lives = 3, scoreA = 0, runningA = false;
const playerA = new Player(ctxA, "#4f8aff");

function startAsteroids() {
    if (runningA) return;
    asteroids = []; lives = 3; scoreA = 0; runningA = true;
    gameLoopA();
}
function gameLoopA() {
    if (!runningA) return;
    ctxA.clearRect(0, 0, ctxA.canvas.width, ctxA.canvas.height);
    playerA.draw();
    if (Math.random() < 0.05) asteroids.push({ x: Math.random() * ctxA.canvas.width, y: -20, r: 10 + Math.random() * 10 });
    ctxA.fillStyle = "#aaa";
    asteroids.forEach(a => { a.y += 4; ctxA.beginPath(); ctxA.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctxA.fill(); });
    asteroids = asteroids.filter(a => {
        const d = Math.hypot(a.x - playerA.x, a.y - playerA.y);
        if (d < a.r + 15) {
            lives--;
            if (lives <= 0) { runningA = false; alert(`💥 Game Over! Score: ${scoreA}`); }
            return false;
        }
        if (a.y > ctxA.canvas.height) { scoreA++; return false; }
        return true;
    });
    ctxA.fillStyle = "#fcd34d";
    ctxA.font = "16px Inter";
    ctxA.fillText(`Lives: ${lives} | Score: ${scoreA}`, 10, 20);
    requestAnimationFrame(gameLoopA);
}

/* === Star Collector === */
let starsArr = [], asteroidsS = [], scoreS = 0, collected = 0, runningS = false;
const playerS = new Player(ctxS, "#fcd34d");

function startStars() {
    if (runningS) return;
    starsArr = []; asteroidsS = []; scoreS = 0; collected = 0; runningS = true;
    gameLoopS();
}
function gameLoopS() {
    if (!runningS) return;
    ctxS.clearRect(0, 0, ctxS.canvas.width, ctxS.canvas.height);
    playerS.draw();
    if (Math.random() < 0.05) starsArr.push({ x: Math.random() * ctxS.canvas.width, y: -20, r: 8, color: "#ffd84b" });
    if (Math.random() < 0.03) asteroidsS.push({ x: Math.random() * ctxS.canvas.width, y: -20, r: 10, color: "#777" });
    [...starsArr, ...asteroidsS].forEach(o => { ctxS.fillStyle = o.color; ctxS.beginPath(); ctxS.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctxS.fill(); o.y += (o.color === "#ffd84b" ? 2 : 3.5); });
    starsArr = starsArr.filter(s => {
        const d = Math.hypot(s.x - playerS.x, s.y - playerS.y);
        if (d < s.r + 15) { scoreS += 5; collected++; return false; }
        return s.y < ctxS.canvas.height;
    });
    asteroidsS = asteroidsS.filter(a => {
        const d = Math.hypot(a.x - playerS.x, a.y - playerS.y);
        if (d < a.r + 15) { scoreS = Math.max(0, scoreS - 3); return false; }
        return a.y < ctxS.canvas.height;
    });
    ctxS.fillStyle = "#fcd34d";
    ctxS.font = "16px Inter";
    ctxS.fillText(`Score: ${scoreS} | Stars: ${collected}⭐`, 10, 20);
    if (scoreS >= 100) { runningS = false; alert("🌟 You Win! Great Job!"); }
    requestAnimationFrame(gameLoopS);
}

/* === Controls === */
window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { if (runningA) playerA.move(-1); if (runningS) playerS.move(-1); }
    if (e.key === "ArrowRight") { if (runningA) playerA.move(1); if (runningS) playerS.move(1); }
});
document.getElementById("startAsteroids").addEventListener("click", startAsteroids);
document.getElementById("startStars").addEventListener("click", startStars);

/* === On-screen Mobile Controls === */
function createMobileControls(containerId, player, isAsteroid) {
    const controlDiv = document.createElement("div");
    controlDiv.className = "mobile-controls mt-2";
    controlDiv.innerHTML = `
    <button class="btn btn-outline-gold me-2">⬅️</button>
    <button class="btn btn-outline-gold">➡️</button>`;
    document.getElementById(containerId).appendChild(controlDiv);

    const [leftBtn, rightBtn] = controlDiv.querySelectorAll("button");
    leftBtn.addEventListener("touchstart", () => { if (isAsteroid && runningA) player.move(-1); if (!isAsteroid && runningS) player.move(-1); });
    rightBtn.addEventListener("touchstart", () => { if (isAsteroid && runningA) player.move(1); if (!isAsteroid && runningS) player.move(1); });
}
createMobileControls("asteroidGame", playerA, true);
createMobileControls("starCollectorGame", playerS, false);
