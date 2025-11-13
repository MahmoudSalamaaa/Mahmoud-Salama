// Everything after DOM is ready
window.addEventListener("DOMContentLoaded", () => {
    /* ========== STARFIELD BACKGROUND ========== */
    const starCanvas = document.getElementById("starfield");
    const starCtx = starCanvas.getContext("2d");
    let stars = [];
    let w, h;

    function initStars() {
        w = starCanvas.width = window.innerWidth;
        h = starCanvas.height = window.innerHeight;
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
        starCtx.fillStyle = "rgba(10, 15, 40, 0.8)";
        starCtx.fillRect(0, 0, w, h);

        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            s.z -= 0.5;
            if (s.z <= 0) s.z = w;
            const k = 128.0 / s.z;
            const px = s.x * k + w / 2;
            const py = s.y * k + h / 2;
            if (px >= 0 && px <= w && py >= 0 && py <= h) {
                const size = (1 - s.z / w) * 2;
                starCtx.beginPath();
                starCtx.arc(px, py, size, 0, Math.PI * 2);
                starCtx.fillStyle = "rgba(255,255,240,0.8)";
                starCtx.fill();
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

    const styleEl = document.createElement("style");
    styleEl.textContent = `
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
    document.head.appendChild(styleEl);

    /* ========== GAMES SETUP ========== */
    const asteroidGameContainer = document.getElementById("asteroidGame");
    const starCollectorContainer = document.getElementById("starCollectorGame");

    const asteroidCanvas = document.createElement("canvas");
    const starCanvasGame = document.createElement("canvas");

    if (asteroidGameContainer) asteroidGameContainer.appendChild(asteroidCanvas);
    if (starCollectorContainer) starCollectorContainer.appendChild(starCanvasGame);

    const ctxA = asteroidCanvas.getContext("2d");
    const ctxS = starCanvasGame.getContext("2d");

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

    function resizeGames() {
        if (asteroidGameContainer) {
            asteroidCanvas.width = asteroidGameContainer.clientWidth || 300;
            asteroidCanvas.height = 220;
        }
        if (starCollectorContainer) {
            starCanvasGame.width = starCollectorContainer.clientWidth || 300;
            starCanvasGame.height = 220;
        }
        playerA.reset();
        playerS.reset();
    }
    window.addEventListener("resize", resizeGames);
    resizeGames();

    /* ========== DIFFICULTY CONFIG (5 LEVELS) ========== */
    const ASTEROID_LEVELS = {
        kid: { label: "Kid", spawnRate: 0.015, speed: 1.6, lives: 8 },
        easy: { label: "Easy", spawnRate: 0.02, speed: 2.0, lives: 7 },
        normal: { label: "Normal", spawnRate: 0.03, speed: 2.7, lives: 5 },
        hard: { label: "Hard", spawnRate: 0.045, speed: 3.5, lives: 3 },
        insane: { label: "Insane", spawnRate: 0.06, speed: 4.2, lives: 2 },
    };

    const STAR_LEVELS = {
        kid: { label: "Kid", starSpawn: 0.1, asteroidSpawn: 0.01, starSpeed: 1.4, asteroidSpeed: 2.2, winScore: 30, penalty: 1 },
        easy: { label: "Easy", starSpawn: 0.09, asteroidSpawn: 0.015, starSpeed: 1.6, asteroidSpeed: 2.5, winScore: 40, penalty: 1 },
        normal: { label: "Normal", starSpawn: 0.07, asteroidSpawn: 0.02, starSpeed: 1.8, asteroidSpeed: 2.8, winScore: 50, penalty: 2 },
        hard: { label: "Hard", starSpawn: 0.06, asteroidSpawn: 0.03, starSpeed: 2.2, asteroidSpeed: 3.2, winScore: 70, penalty: 3 },
        insane: { label: "Insane", starSpawn: 0.055, asteroidSpawn: 0.04, starSpeed: 2.6, asteroidSpeed: 3.6, winScore: 90, penalty: 4 },
    };

    let asteroidLevel = "kid";
    let asteroidConfig = ASTEROID_LEVELS[asteroidLevel];

    let starLevel = "kid";
    let starConfig = STAR_LEVELS[starLevel];

    // difficulty buttons (from HTML)
    const diffButtons = document.querySelectorAll(".difficulty-controls button[data-game][data-level]");
    diffButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const game = btn.dataset.game;
            const lvl = btn.dataset.level;

            // clear active only in same group
            const parent = btn.parentElement;
            parent.querySelectorAll("button[data-level]").forEach((b) =>
                b.classList.remove("active")
            );
            btn.classList.add("active");

            if (game === "asteroid") {
                asteroidLevel = lvl;
                asteroidConfig = ASTEROID_LEVELS[lvl];
            } else if (game === "stars") {
                starLevel = lvl;
                starConfig = STAR_LEVELS[lvl];
            }
        });
    });

    /* ========== ASTEROID GAME ========== */
    let asteroids = [];
    let lives = asteroidConfig.lives;
    let scoreA = 0;
    let runningA = false;

    function startAsteroids() {
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

        ctxA.clearRect(0, 0, asteroidCanvas.width, asteroidCanvas.height);
        ctxA.fillStyle = "rgba(10,15,40,0.9)";
        ctxA.fillRect(0, 0, asteroidCanvas.width, asteroidCanvas.height);

        playerA.draw();

        if (Math.random() < asteroidConfig.spawnRate) {
            asteroids.push({
                x: Math.random() * asteroidCanvas.width,
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
                    alert("💥 Game Over! Your Score: " + scoreA);
                }
                return false;
            }
            if (a.y > asteroidCanvas.height) {
                scoreA++;
                return false;
            }
            return true;
        });

        ctxA.fillStyle = "#fcd34d";
        ctxA.font = "16px Inter";
        ctxA.fillText(`Lives: ${lives} | Score: ${scoreA}`, 10, 22);
        ctxA.fillText("Use ⬅️ ➡️ or mouse to move", 10, 42);
        ctxA.fillText(`Level: ${ASTEROID_LEVELS[asteroidLevel].label}`, 10, 62);

        requestAnimationFrame(gameLoopA);
    }

    /* ========== STAR COLLECTOR GAME ========== */
    let starsArr = [];
    let asteroidsS = [];
    let scoreS = 0;
    let collected = 0;
    let runningS = false;

    function startStars() {
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

        ctxS.clearRect(0, 0, starCanvasGame.width, starCanvasGame.height);
        ctxS.fillStyle = "rgba(10,15,40,0.9)";
        ctxS.fillRect(0, 0, starCanvasGame.width, starCanvasGame.height);

        playerS.draw();

        if (Math.random() < starConfig.starSpawn) {
            starsArr.push({
                x: Math.random() * starCanvasGame.width,
                y: -20,
                r: 8,
                color: "#ffd84b",
            });
        }
        if (Math.random() < starConfig.asteroidSpawn) {
            asteroidsS.push({
                x: Math.random() * starCanvasGame.width,
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
            return s.y < starCanvasGame.height;
        });

        asteroidsS = asteroidsS.filter((a) => {
            const d = Math.hypot(a.x - playerS.x, a.y - playerS.y);
            if (d < a.r + 12) {
                scoreS = Math.max(0, scoreS - starConfig.penalty);
                return false;
            }
            return a.y < starCanvasGame.height;
        });

        ctxS.fillStyle = "#fcd34d";
        ctxS.font = "16px Inter";
        ctxS.fillText(`Score: ${scoreS} | Stars: ${collected}⭐`, 10, 22);
        ctxS.fillText(`Reach ${starConfig.winScore} points to win!`, 10, 42);
        ctxS.fillText("Use ⬅️ ➡️ or mouse to move", 10, 62);
        ctxS.fillText(`Level: ${STAR_LEVELS[starLevel].label}`, 10, 82);

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

    /* ========== MOUSE & TOUCH MOVE CONTROLS ========== */
    function enableMouseControl(canvasEl, player, isAsteroidGame) {
        if (!canvasEl) return;
        canvasEl.style.cursor = "pointer";

        function setPlayerFromClientX(clientX) {
            const rect = canvasEl.getBoundingClientRect();
            const x = clientX - rect.left;
            player.x = Math.min(Math.max(x, 20), canvasEl.width - 20);
        }

        canvasEl.addEventListener("mousemove", (e) => {
            if (isAsteroidGame && !runningA) return;
            if (!isAsteroidGame && !runningS) return;
            setPlayerFromClientX(e.clientX);
        });

        canvasEl.addEventListener("mousedown", (e) => {
            setPlayerFromClientX(e.clientX);
            if (isAsteroidGame) {
                if (!runningA) startAsteroids();
            } else {
                if (!runningS) startStars();
            }
        });

        canvasEl.addEventListener(
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

        canvasEl.addEventListener(
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

    enableMouseControl(asteroidCanvas, playerA, true);
    enableMouseControl(starCanvasGame, playerS, false);

    // expose start functions if needed in console
    window._startAsteroids = startAsteroids;
    window._startStars = startStars;
});
