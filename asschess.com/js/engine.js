import {
	doChess,
	getSquareNum,
	getState,
	redoMove,
	setEngine,
	undoMove,
} from "./game.js";
var eval_p = document.getElementById("eval");
var best_move = document.getElementById("best-move");
var engine_toggle = document.getElementById("engine-toggle");
var active_workers = [];

export async function doBestMove() {
	if (best_move.innerHTML == "----") {
		return;
	}
	var best = best_move.innerHTML;
	var square1 = document.getElementById(`${getSquareNum(best.slice(0, 2))}`);
	var square2 = document.getElementById(`${getSquareNum(best.slice(2, 4))}`);
	var promote = best.length == 5 ? best.slice(4, 5) : "";
	if (!square1.classList.contains("selected")) {
		doChess(square1, promote);
	}
	doChess(square2, promote);
}

function checkToggle() {
	active_workers.forEach((worker) => worker.terminate());
	active_workers = [];
	if (engine_toggle.checked) {
		activateEngine();
	} else {
		eval_p.innerHTML = "----";
		best_move.innerHTML = "----";
	}
}

function activateEngine() {
	if (window.Worker) {
		const stockfish = initEngine();
		setEngine(stockfish);
		updateEngine(stockfish);
	} else {
		console.error("Web Workers are not supported in your browser.");
	}
}

function initEngine() {
	const stockfish = new Worker("./stockfish/stockfish-nnue-16.js");
	active_workers.push(stockfish);
	stockfish.onerror = function (error) {
		console.error("Stockfish Worker error:", error);
	};
	return stockfish;
}

export function updateEngine(engine) {
	engine.postMessage("stop");
	var my_fen = getState().fen() + " moves " + getState().history().join(" ");
	engine.postMessage("position fen " + my_fen);
	engine.postMessage("go depth 25");
	engine.onmessage = function (event) {
		updateEval(event, engine);
		updateBestMove(event);
	};
}

function updateEval(event, stockfish) {
	var words = event.data.split(" ");
	var chess = getState();
	var side = chess.fen().split(" ")[1];
	var adj = side == "w" ? 1 : -1;
	if (chess.game_over()) {
		eval_p.innerHTML = chess.in_draw()
			? "1/2-1/2"
			: side == "w"
			? "0-1"
			: "1-0";
		best_move.innerHTML = "----";
		stockfish.postMessage("stop");
	}
	if (words.includes("cp")) {
		let ev = words[words.indexOf("cp") + 1];
		eval_p.innerHTML = (adj * ev > 0 ? "+" : "") + (adj * ev) / 100;
	} else if (words.includes("mate")) {
		let ev = words[words.indexOf("mate") + 1];
		eval_p.innerHTML = "#" + adj * ev;
	}
}

function updateBestMove(event) {
	const message = event.data;
	var words = message.split(" ");
	if (words.includes("pv")) {
		best_move.innerHTML = words[words.indexOf("pv") + 1];
	}
}

document.body.onkeyup = function (event) {
	if (document.activeElement.name != "input") {
		if (event.key == " " && engine_toggle.checked) {
			doBestMove();
		} else if (event.key == "ArrowLeft") {
			undoMove();
		} else if (event.key == "ArrowRight") {
			redoMove();
		}
		event.preventDefault();
	}
};
engine_toggle.onkeyup = function (event) {
	event.preventDefault();
};
engine_toggle.addEventListener("click", checkToggle);
document.addEventListener("dragstart", (e) => {
	e.preventDefault();
});
