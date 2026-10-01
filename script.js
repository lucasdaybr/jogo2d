const state = {

    players: {
        1: {
            money: 1000,
            wins: 0
        },

        2: {
            money: 1000,
            wins: 0
        }
    },

    rouletteColor: "red",

    coinChoice: "heads",

    playing: false
};


/* ELEMENTOS */

const money1 = document.getElementById("money1");
const money2 = document.getElementById("money2");

const wins1 = document.getElementById("wins1");
const wins2 = document.getElementById("wins2");

const historyList =
    document.getElementById("historyList");


/* ATUALIZAR HUD */

function updateHUD() {

    money1.textContent =
        state.players[1].money;

    money2.textContent =
        state.players[2].money;

    wins1.textContent =
        state.players[1].wins;

    wins2.textContent =
        state.players[2].wins;
}


/* HISTÓRICO */

function addHistory(text, type = "") {

    const empty =
        historyList.querySelector(".empty");

    if (empty) {
        empty.remove();
    }

    const item =
        document.createElement("div");

    item.className =
        "history-item";

    item.innerHTML =
        text;

    historyList.prepend(item);

    while (historyList.children.length > 15) {
        historyList.lastChild.remove();
    }
}


/* VALIDAR APOSTA */

function getBet(player, input) {

    let bet =
        parseInt(input.value);

    if (isNaN(bet))
        return null;

    bet = Math.floor(bet);

    if (bet < 10)
        return null;

    if (bet > state.players[player].money)
        return null;

    return bet;
}


/* MENUS */

document
    .querySelectorAll(".game-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".game-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            document
                .querySelectorAll(".game-screen")
                .forEach(screen =>
                    screen.classList.remove("active")
                );

            button.classList.add("active");

            document
                .getElementById(button.dataset.game)
                .classList.add("active");
        });
    });


/* =========================
   ROLETA
========================= */

document
    .querySelectorAll(".color-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".color-btn")
                .forEach(btn =>
                    btn.classList.remove("selected")
                );

            button.classList.add("selected");

            state.rouletteColor =
                button.dataset.color;
        });
    });


const spinBtn =
    document.getElementById("spinBtn");

const wheel =
    document.getElementById("wheel");

const rouletteResult =
    document.getElementById("rouletteResult");


spinBtn.addEventListener("click", () => {

    if (state.playing)
        return;

    const player =
        parseInt(
            document.getElementById(
                "roulettePlayer"
            ).value
        );

    const bet =
        getBet(
            player,
            document.getElementById(
                "rouletteBet"
            )
        );

    if (!bet) {

        rouletteResult.textContent =
            "⚠️ Aposta inválida.";

        return;
    }

    state.playing = true;

    spinBtn.disabled = true;

    state.players[player].money -= bet;

    updateHUD();

    wheel.classList.remove("spin");

    void wheel.offsetWidth;

    wheel.classList.add("spin");

    rouletteResult.textContent =
        "🎡 A roleta está girando...";

    setTimeout(() => {

        const number =
            Math.floor(
                Math.random() * 37
            );

        let resultColor;

        if (number === 0) {
            resultColor = "green";
        }
        else {
            resultColor =
                number % 2 === 0
                    ? "black"
                    : "red";
        }

        let payout = 0;

        if (
            state.rouletteColor === resultColor
        ) {

            payout = bet * 2;

            state.players[player].money +=
                payout;

            state.players[player].wins++;

            rouletteResult.innerHTML =
                `🎉 <strong>Você ganhou!</strong>
                 Número ${number} —
                 ${resultColor}.`;

            addHistory(
                `🎡 Jogador ${player} ganhou
                 <strong>${payout}</strong>
                 fichas na roleta.`
            );

        }
        else {

            rouletteResult.innerHTML =
                `💥 Perdeu!
                 Número ${number} —
                 ${resultColor}.`;

            addHistory(
                `🎡 Jogador ${player} perdeu
                 <strong>${bet}</strong>
                 fichas na roleta.`
            );
        }

        updateHUD();

        state.playing = false;

        spinBtn.disabled = false;

    }, 3100);

});


/* =========================
   CARA OU COROA
========================= */

document
    .querySelectorAll(".choice-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".choice-btn")
                .forEach(btn =>
                    btn.classList.remove("selected")
                );

            button.classList.add("selected");

            state.coinChoice =
                button.dataset.choice;
        });
    });


const flipBtn =
    document.getElementById("flipBtn");

const coin =
    document.getElementById("coinObject");

const coinResult =
    document.getElementById("coinResult");


flipBtn.addEventListener("click", () => {

    if (state.playing)
        return;

    const player =
        parseInt(
            document.getElementById(
                "coinPlayer"
            ).value
        );

    const bet =
        getBet(
            player,
            document.getElementById(
                "coinBet"
            )
        );

    if (!bet) {

        coinResult.textContent =
            "⚠️ Aposta inválida.";

        return;
    }

    state.playing = true;

    flipBtn.disabled = true;

    state.players[player].money -= bet;

    updateHUD();

    coin.classList.remove("flip");

    void coin.offsetWidth;

    coin.classList.add("flip");

    coinResult.textContent =
        "🪙 A moeda está girando...";

    setTimeout(() => {

        const result =
            Math.random() < .5
                ? "heads"
                : "tails";

        const name =
            result === "heads"
                ? "Cara"
                : "Coroa";

        coin.textContent =
            result === "heads"
                ? "🟡"
                : "🔵";

        if (result === state.coinChoice) {

            const payout =
                bet * 2;

            state.players[player].money +=
                payout;

            state.players[player].wins++;

            coinResult.innerHTML =
                `🎉 <strong>Você ganhou!</strong>
                 Deu ${name}.`;

            addHistory(
                `🪙 Jogador ${player} ganhou
                 <strong>${payout}</strong>
                 fichas em Cara ou Coroa.`
            );

        }
        else {

            coinResult.innerHTML =
                `💥 Você perdeu!
                 Deu ${name}.`;

            addHistory(
                `🪙 Jogador ${player} perdeu
                 <strong>${bet}</strong>
                 fichas.`
            );
        }

        updateHUD();

        state.playing = false;

        flipBtn.disabled = false;

    }, 1600);

});


/* =========================
   DADOS
========================= */

const diceFaces = [
    "",
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
];

const rollDiceBtn =
    document.getElementById(
        "rollDiceBtn"
    );

const dice1 =
    document.getElementById("dice1");

const dice2 =
    document.getElementById("dice2");

const diceResult =
    document.getElementById(
        "diceResult"
    );


rollDiceBtn.addEventListener("click", () => {

    if (state.playing)
        return;

    const bet1 =
        getBet(
            1,
            document.getElementById(
                "diceBet1"
            )
        );

    const bet2 =
        getBet(
            2,
            document.getElementById(
                "diceBet2"
            )
        );

    if (!bet1 || !bet2) {

        diceResult.textContent =
            "⚠️ Os dois jogadores precisam ter apostas válidas.";

        return;
    }

    state.playing = true;

    rollDiceBtn.disabled = true;

    state.players[1].money -= bet1;
    state.players[2].money -= bet2;

    updateHUD();

    dice1.classList.remove("rolling");
    dice2.classList.remove("rolling");

    void dice1.offsetWidth;

    dice1.classList.add("rolling");
    dice2.classList.add("rolling");

    diceResult.textContent =
        "🎲 Rolando os dados...";

    setTimeout(() => {

        const value1 =
            Math.floor(
                Math.random() * 6
            ) + 1;

        const value2 =
            Math.floor(
                Math.random() * 6
            ) + 1;

        dice1.textContent =
            diceFaces[value1];

        dice2.textContent =
            diceFaces[value2];

        if (value1 > value2) {

            const prize =
                bet1 + bet2;

            state.players[1].money +=
                prize;

            state.players[1].wins++;

            diceResult.innerHTML =
                `🏆 <strong>Jogador 1 venceu!</strong>
                 ${value1} × ${value2}`;

            addHistory(
                `🎲 Jogador 1 venceu os dados
                 e ganhou <strong>${prize}</strong>
                 fichas.`
            );

        }

        else if (value2 > value1) {

            const prize =
                bet1 + bet2;

            state.players[2].money +=
                prize;

            state.players[2].wins++;

            diceResult.innerHTML =
                `🏆 <strong>Jogador 2 venceu!</strong>
                 ${value2} × ${value1}`;

            addHistory(
                `🎲 Jogador 2 venceu os dados
                 e ganhou <strong>${prize}</strong>
                 fichas.`
            );

        }

        else {

            state.players[1].money +=
                bet1;

            state.players[2].money +=
                bet2;

            diceResult.innerHTML =
                `🤝 <strong>Empate!</strong>
                 ${value1} × ${value2}`;

            addHistory(
                `🎲 Empate nos dados.
                 As apostas foram devolvidas.`
            );
        }

        updateHUD();

        state.playing = false;

        rollDiceBtn.disabled = false;

    }, 900);

});


/* =========================
   RESET
========================= */

document
    .getElementById("resetBtn")
    .addEventListener("click", () => {

        const confirmReset =
            confirm(
                "Deseja reiniciar o cassino?"
            );

        if (!confirmReset)
            return;

        state.players[1].money = 1000;
        state.players[2].money = 1000;

        state.players[1].wins = 0;
        state.players[2].wins = 0;

        state.playing = false;

        updateHUD();

        historyList.innerHTML =
            `<p class="empty">
                Nenhuma jogada ainda.
             </p>`;

        rouletteResult.textContent =
            "Faça sua aposta!";

        coinResult.textContent =
            "Escolha Cara ou Coroa.";

        diceResult.textContent =
            "Faça sua aposta e role os dados.";

        dice1.textContent = "⚄";
        dice2.textContent = "⚄";

        coin.textContent = "?";
    });


/* INICIALIZAÇÃO */

updateHUD();
