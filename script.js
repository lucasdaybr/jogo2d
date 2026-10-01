const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const health1 = document.getElementById("health1");
const health2 = document.getElementById("health2");
const special1 = document.getElementById("special1");
const special2 = document.getElementById("special2");
const timerElement = document.getElementById("timer");
const message = document.getElementById("message");

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.code] = true;

    if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]
        .includes(e.code)
    ) {
        e.preventDefault();
    }

    if (e.code === "Enter" && !gameRunning) {
        startGame();
    }
});

document.addEventListener("keyup", e => {
    keys[e.code] = false;
});

const gravity = 0.7;
const groundY = 530;

let gameRunning = false;
let gameOver = false;
let timeLeft = 180;
let lastTime = 0;

const platforms = [
    { x: 0, y: 530, width: 1000, height: 70 },
    { x: 100, y: 420, width: 250, height: 20 },
    { x: 650, y: 420, width: 250, height: 20 },
    { x: 360, y: 330, width: 280, height: 20 },
    { x: 40, y: 250, width: 180, height: 20 },
    { x: 780, y: 250, width: 180, height: 20 }
];

class Player {

    constructor(x, color, controls, name) {
        this.x = x;
        this.y = 400;

        this.width = 42;
        this.height = 65;

        this.vx = 0;
        this.vy = 0;

        this.speed = 5;
        this.jump = 13;

        this.color = color;
        this.name = name;
        this.controls = controls;

        this.health = 100;
        this.special = 0;

        this.grounded = false;
        this.facing = 1;

        this.attacking = false;
        this.attackTimer = 0;

        this.dashTimer = 0;
        this.hitCooldown = 0;

        this.attackCooldown = 0;
        this.specialCooldown = 0;
    }

    update(opponent) {

        if (this.health <= 0) return;

        if (this.hitCooldown > 0)
            this.hitCooldown--;

        if (this.attackCooldown > 0)
            this.attackCooldown--;

        if (this.specialCooldown > 0)
            this.specialCooldown--;

        if (this.dashTimer > 0)
            this.dashTimer--;

        if (this.attackTimer > 0) {
            this.attackTimer--;

            if (this.attackTimer <= 0)
                this.attacking = false;
        }

        let moving = false;

        if (keys[this.controls.left]) {
            this.vx = -this.speed;
            this.facing = -1;
            moving = true;
        }

        if (keys[this.controls.right]) {
            this.vx = this.speed;
            this.facing = 1;
            moving = true;
        }

        if (!moving) {
            this.vx *= 0.75;
        }

        if (
            keys[this.controls.jump] &&
            this.grounded &&
            !this.jumpPressed
        ) {
            this.vy = -this.jump;
            this.grounded = false;
            this.jumpPressed = true;
        }

        if (!keys[this.controls.jump]) {
            this.jumpPressed = false;
        }

        if (
            keys[this.controls.attack] &&
            this.attackCooldown <= 0
        ) {
            this.attack(opponent);
        }

        if (
            keys[this.controls.dash] &&
            !this.dashPressed
        ) {
            this.dash();
            this.dashPressed = true;
        }

        if (!keys[this.controls.dash]) {
            this.dashPressed = false;
        }

        if (
            keys[this.controls.special] &&
            !this.specialPressed
        ) {
            this.useSpecial(opponent);
            this.specialPressed = true;
        }

        if (!keys[this.controls.special]) {
            this.specialPressed = false;
        }

        this.vy += gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.collision();

        // Limites laterais
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }

        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
            this.vx = 0;
        }

        // Caiu fora
        if (this.y > canvas.height + 100) {
            this.health = 0;
        }
    }

    collision() {

        this.grounded = false;

        for (const platform of platforms) {

            const horizontal =
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width;

            const falling =
                this.vy >= 0;

            const previousBottom =
                this.y + this.height - this.vy;

            const currentBottom =
                this.y + this.height;

            if (
                horizontal &&
                falling &&
                previousBottom <= platform.y &&
                currentBottom >= platform.y
            ) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.grounded = true;
            }
        }
    }

    attack(opponent) {

        this.attacking = true;
        this.attackTimer = 12;
        this.attackCooldown = 25;

        const range = 65;

        const attackX =
            this.facing === 1
                ? this.x + this.width
                : this.x - range;

        const attackY = this.y + 15;

        const hit =
            attackX < opponent.x + opponent.width &&
            attackX + range > opponent.x &&
            attackY < opponent.y + opponent.height &&
            attackY + 35 > opponent.y;

        if (hit && opponent.hitCooldown <= 0) {

            opponent.takeDamage(8, this.facing);

            this.special = Math.min(
                100,
                this.special + 10
            );
        }
    }

    dash() {

        this.dashTimer = 8;

        this.vx = this.facing * 18;
    }

    useSpecial(opponent) {

        if (this.special < 100)
            return;

        if (this.specialCooldown > 0)
            return;

        this.special = 0;
        this.specialCooldown = 60;

        const distance =
            Math.abs(
                (this.x + this.width / 2) -
                (opponent.x + opponent.width / 2)
            );

        if (distance < 250) {

            const direction =
                opponent.x > this.x ? 1 : -1;

            opponent.takeDamage(25, direction);

            // Efeito de knockback
            opponent.vy = -10;
            opponent.vx = direction * 15;
        }
    }

    takeDamage(amount, direction) {

        if (this.hitCooldown > 0)
            return;

        this.health -= amount;

        this.health = Math.max(0, this.health);

        this.hitCooldown = 25;

        this.vx = direction * 10;
        this.vy = -7;

        this.special = Math.min(
            100,
            this.special + 5
        );
    }

    draw() {

        ctx.save();

        // efeito quando toma dano
        if (this.hitCooldown > 0 && this.hitCooldown % 4 < 2) {
            ctx.globalAlpha = 0.45;
        }

        // sombra
        ctx.fillStyle = "rgba(0,0,0,.35)";
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.width / 2,
            this.y + this.height + 5,
            25,
            7,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // corpo
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );

        // cabeça
        ctx.fillStyle = "#ffd0a8";
        ctx.fillRect(
            this.x + 7,
            this.y - 22,
            this.width - 14,
            22
        );

        // olhos
        ctx.fillStyle = "#111";

        const eyeX =
            this.facing === 1
                ? this.x + 27
                : this.x + 10;

        ctx.fillRect(
            eyeX,
            this.y - 15,
            5,
            5
        );

        // ataque
        if (this.attacking) {

            ctx.fillStyle = "#fff";

            const swordX =
                this.facing === 1
                    ? this.x + this.width
                    : this.x - 55;

            ctx.fillRect(
                swordX,
                this.y + 25,
                55,
                8
            );

            ctx.fillStyle = "#ffe66d";

            ctx.fillRect(
                swordX,
                this.y + 23,
                55,
                3
            );
        }

        // nome
        ctx.fillStyle = "#fff";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            this.name,
            this.x + this.width / 2,
            this.y - 30
        );

        ctx.restore();
    }
}

const player1 = new Player(
    150,
    "#2495ff",
    {
        left: "KeyA",
        right: "KeyD",
        jump: "KeyW",
        attack: "KeyF",
        dash: "KeyG",
        special: "KeyH"
    },
    "PLAYER 1"
);

const player2 = new Player(
    800,
    "#ff4056",
    {
        left: "ArrowLeft",
        right: "ArrowRight",
        jump: "ArrowUp",
        attack: "Numpad1",
        dash: "Numpad2",
        special: "Numpad3"
    },
    "PLAYER 2"
);

function resetPlayers() {

    player1.x = 150;
    player1.y = 400;
    player1.vx = 0;
    player1.vy = 0;
    player1.health = 100;
    player1.special = 0;

    player2.x = 800;
    player2.y = 400;
    player2.vx = 0;
    player2.vy = 0;
    player2.health = 100;
    player2.special = 0;
}

function startGame() {

    gameRunning = true;
    gameOver = false;

    timeLeft = 180;

    resetPlayers();

    message.style.display = "none";
}

function endGame(text) {

    gameRunning = false;
    gameOver = true;

    message.innerHTML = `
        <h1>${text}</h1>
        <p>Pressione ENTER para jogar novamente</p>
    `;

    message.style.display = "flex";
}

function updateTimer(delta) {

    timeLeft -= delta / 1000;

    if (timeLeft <= 0) {

        timeLeft = 0;

        if (player1.health > player2.health)
            endGame("PLAYER 1 VENCEU!");

        else if (player2.health > player1.health)
            endGame("PLAYER 2 VENCEU!");

        else
            endGame("EMPATE!");
    }

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        Math.floor(timeLeft % 60);

    timerElement.textContent =
        `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function checkWinner() {

    if (player1.health <= 0) {
        endGame("PLAYER 2 VENCEU!");
    }

    else if (player2.health <= 0) {
        endGame("PLAYER 1 VENCEU!");
    }
}

function drawBackground() {

    // céu
    const gradient =
        ctx.createLinearGradient(
            0, 0,
            0, canvas.height
        );

    gradient.addColorStop(0, "#141b3d");
    gradient.addColorStop(1, "#080b19");

    ctx.fillStyle = gradient;
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // lua
    ctx.fillStyle = "#fff1b8";
    ctx.beginPath();
    ctx.arc(
        500,
        90,
        45,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // prédios
    ctx.fillStyle = "#10162c";

    for (let x = 0; x < canvas.width; x += 80) {

        const height =
            80 + Math.random() * 100;

        ctx.fillRect(
            x,
            groundY - height,
            60,
            height
        );
    }
}

function drawPlatforms() {

    for (const p of platforms) {

        ctx.fillStyle = "#242b4a";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

        ctx.fillStyle = "#56618f";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            5
        );
    }
}

function updateHUD() {

    health1.style.width =
        player1.health + "%";

    health2.style.width =
        player2.health + "%";

    special1.style.width =
        player1.special + "%";

    special2.style.width =
        player2.special + "%";
}

function draw() {

    drawBackground();

    drawPlatforms();

    player1.draw();
    player2.draw();
}

function gameLoop(timestamp) {

    const delta =
        timestamp - lastTime;

    lastTime = timestamp;

    if (gameRunning) {

        player1.update(player2);
        player2.update(player1);

        updateTimer(delta);

        checkWinner();

        updateHUD();
    }

    draw();

    requestAnimationFrame(gameLoop);
}

updateHUD();

requestAnimationFrame(gameLoop);