const gameStatus = document.querySelector(".game--status");

let jugadorAi = "X";

let jugadorHumano = "O";

let gameBoard;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
const cells = document.querySelectorAll(".cell");

startGame();

function selectSym(sym) {
    jugadorHumano = sym;
    jugadorAi = sym === "O" ? "X" : "O";
    gameBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener("click", turnClick, false);
    }
    if (jugadorAi === "X") {
        turn(bestSpot(), jugadorAi);
    }
    document.querySelector(".selectSym").style.display = "none";
}

function startGame() {
    document.querySelector(".selectSym").style.display = "block";
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = "";
        cells[i].style.backgroundColor = "transparent";
    }
}

function turnClick(e) {
    if (typeof gameBoard[e.target.id] === "number") {
        turn(e.target.id, jugadorHumano);
        if (
            !verificarResultado(gameBoard, jugadorHumano) &&
            !verificarEmpate()
        ) {
            turn(bestSpot(), jugadorAi);
        }
    }
}

function turn(id, player) {
    gameBoard[id] = player;
    document.getElementById(id).innerText = player;
    let juegoGanado = verificarResultado(gameBoard, player);
    if (juegoGanado) juegoTerminado(juegoGanado);
    verificarEmpate();
}

function verificarResultado(gameBoard, player) {
    let jugadores = gameBoard.reduce(
        (a, e, i) => (e === player ? a.concat(i) : a),
        []
    );

    let juegoGanado = null;
    for (let [i, ganador] of winningConditions.entries()) {
        if (ganador.every((e) => jugadores.indexOf(e) > -1)) {
            juegoGanado = { index: i, player: player };
            break;
        }
    }
    return juegoGanado;
}

function juegoTerminado(juegoGanado) {
    for (let index of winningConditions[juegoGanado.index]) {
        document.getElementById(index).style.backgroundColor =
            juegoGanado.player === jugadorHumano
                ? "var(--blue-green)"
                : "var(--imperial-red)";
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener("click", turnClick, false);
    }
    ganador(juegoGanado.player === jugadorHumano ? "You Win!" : "You lose!");
}

function ganador(mensaje) {
    gameStatus.innerHTML = mensaje;
}

function emptySquares() {
    return gameBoard.filter((e, i) => i === e);
}

function bestSpot() {
    return minimax(gameBoard, jugadorAi).index;
}

function verificarEmpate() {
    if (emptySquares().length === 0) {
        for (let cell of cells) {
            cell.style.backgroundColor = "var(--green-sheen)";
            document.querySelector("section").classList.add("animate__zoomIn");
            cell.removeEventListener("click", turnClick, false);
        }
        ganador("Es un Empate");

        return true;
    }
    return false;
}

function minimax(tablero, player) {
    let availSpots = emptySquares(tablero);
    if (verificarResultado(tablero, jugadorHumano)) {
        return { score: -10 };
    } else if (verificarResultado(tablero, jugadorAi)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    let movimientos = [];

    for (let i = 0; i < availSpots.length; i++) {
        let movimiento = {};
        movimiento.index = tablero[availSpots[i]];
        tablero[availSpots[i]] = player;
        if (player === jugadorAi) {
            movimiento.score = minimax(tablero, jugadorHumano).score;
        } else {
            movimiento.score = minimax(tablero, jugadorAi).score;
        }
        tablero[availSpots[i]] = movimiento.index;
        if (
            (player === jugadorAi && movimiento.score === 10) ||
            (player === jugadorHumano && movimiento.score === -10)
        ) {
            return movimiento;
        } else {
            movimientos.push(movimiento);
        }
    }

    let mejorMovimiento, mejorPuntaje;
    if (player === jugadorAi) {
        mejorPuntaje = -10000;
        for (let i = 0; i < movimientos.length; i++) {
            if (movimientos[i].score > mejorPuntaje) {
                mejorPuntaje = movimientos[i].score;
                mejorMovimiento = i;
            }
        }
    } else {
        mejorPuntaje = 1000;
        for (let i = 0; i < movimientos.length; i++) {
            if (movimientos[i].score < mejorPuntaje) {
                mejorPuntaje = movimientos[i].score;
                mejorMovimiento = i;
            }
        }
    }
    return movimientos[mejorMovimiento];
}

document.querySelector(".game--restart").addEventListener("click", startGame);
