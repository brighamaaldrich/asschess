import { Chess } from "./chess.js";
import { doBestMove, updateEngine } from "./engine.js";

/********************************* FUNCTIONS *********************************/
function doClick(e) {
	var t = e.currentTarget;
	var image = t.firstChild;
	var piece_name = image.src.split("/");
	var piece_color = piece_name[piece_name.length - 1].charAt(0);
	if (piece_color == chess.turn()) {
		doDrag(t, image);
	}
	doChess(t);
	e.preventDefault();
}

function doDrag(t, image) {
	image.style.zIndex = 1000;
	var isDragging = true;
	var rect = t.getBoundingClientRect();
	var hasExited = false;
	var pos = {
		x: rect.left + image.width / 2,
		y: rect.top + image.height / 2,
	};

	const getEventPosition = (e) => {
		if (e.touches && e.touches[0]) {
			return { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}
		return { x: e.clientX, y: e.clientY };
	};
	const onMove = (e) => {
		if (isDragging) {
			pos = getEventPosition(e);
			image.style.left = `${pos.x - rect.left - image.width / 2}px`;
			image.style.top = `${pos.y - rect.top - image.height / 2}px`;
			let outsideX = pos.x < rect.left || pos.x > rect.left + image.width;
			let outsideY = pos.y < rect.top || pos.y > rect.top + image.height;
			hasExited = hasExited || outsideX || outsideY;
		}
		e.preventDefault();
	};
	const onEnd = () => {
		if (isDragging) {
			const endTarget = document.elementFromPoint(pos.x, pos.y);
			if (hasExited && endTarget.matches(".square")) doChess(endTarget);
			resetPosition();
			image.style.zIndex = 99;
			isDragging = false;
		}
	};
	const resetPosition = () => {
		image.style.left = "0";
		image.style.top = "0";
	};

	document.addEventListener("mousemove", onMove);
	document.addEventListener("touchmove", onMove, { passive: false });
	document.addEventListener("mouseup", onEnd);
	document.addEventListener("touchend", onEnd);
	document.addEventListener("dragstart", (e) => {
		e.preventDefault();
	});
}

export function doChess(t, promote) {
	if (chess.game_over()) return;
	var f_piece = chess.get(getSquare(sel));
	var target = getCastleTarget(f_piece, getSquare(t.id));
	var t_piece = chess.get(target);
	if (t.id == sel) {
		sel = -1;
	} else if (t_piece != null && chess.turn() == t_piece.color) {
		sel = getSquareNum(target);
	} else if (sel == -1) {
		return;
	} else {
		makeMove(target, promote);
		sel = -1;
	}
	updateSelection();
}

function getCastleTarget(f_piece, target) {
	if (f_piece && f_piece.type == "k") {
		if (target == "h1" && !chess.get("g1")) {
			return "g1";
		} else if (target == "a1" && !chess.get("c1")) {
			return "c1";
		} else if (target == "h8" && !chess.get("g8")) {
			return "g8";
		} else if (target == "a8" && !chess.get("c8")) {
			return "c8";
		}
	}
	return target;
}

function makeMove(target, promote) {
	var from = getSquare(sel);
	var from_p = chess.get(from);
	var vmoves = chess.moves({ square: from, verbose: true });
	var moves = [];
	for (let i = 0; i < vmoves.length; i++) {
		moves.push(vmoves[i].to);
	}
	if (moves.includes(target)) {
		if (from_p.type == "p" && ["1", "8"].includes(target.charAt(1))) {
			promote = promptPromotion(promote);
		}
		chess.move({ from: from, to: target, promotion: promote });
		curr_head.addItem(from, target, chess.history().pop());
		curr_head = curr_head.next;
		updatePosition();
		updateMoveList();
	}
}

function promptPromotion(promote) {
	if (promote) return promote.toLowerCase();
	var prompt = "What would you like to promote to? (Q, R, B, N)";
	var promotion = window.prompt(prompt).toLowerCase();
	while (!["q", "r", "b", "n"].includes(promotion)) {
		promotion = window.prompt("Try Again: " + prompt).toLowerCase();
	}
	return promotion;
}

function updateMoveList() {
	var lines = LinkedToList(curr_head);
	move_list.textContent = "";
	lines.forEach((line) => {
		let li_move = document.createElement("li");
		li_move.classList.add("li-move");
		li_move.id = line.from + " " + line.to;
		li_move.innerHTML = line.san;
		if (line === curr_head) {
			li_move.classList.add("curr-move");
		}
		move_list.appendChild(li_move);
	});
}

function setSquare(sq, piece) {
	var n = getSquareNum(sq);
	var square = document.getElementById("" + n);
	var color = chess.get(sq).color;
	square.classList.remove("check");
	square.firstChild.src = "assets/" + color + piece + ".svg";
	square.classList.remove("empty");
	if (
		chess.turn() == color &&
		piece.toUpperCase() == "K" &&
		chess.in_check()
	) {
		square.classList.add("check");
	}
}

function getSquare(id) {
	var f = id % 8;
	var r = Math.floor(id / 8);
	return FILE_MAP[f] + RANK_MAP[r];
}

export function getSquareNum(sq) {
	var file = sq.charAt(0);
	var rank = sq.charAt(1);
	var f = FILE_MAP_REV[file];
	var r = RANK_MAP_REV[rank];
	return r * 8 + f;
}

function updateSelection() {
	var squares = document.getElementsByClassName("square");
	for (let i = 0; i < squares.length; i++) {
		squares[i].classList.remove("selected");
		squares[i].classList.remove("legal");
	}
	if (sel != -1) {
		document.getElementById(sel).classList.add("selected");
	}
	var vmoves = chess.moves({ verbose: true });
	for (let i = 0; i < vmoves.length; i++) {
		let nfrom = getSquareNum(vmoves[i].from);
		let nto = getSquareNum(vmoves[i].to);
		if (nfrom == sel) {
			document.getElementById(nto).classList.add("legal");
			if (vmoves[i].san == "O-O") {
				document.getElementById(nfrom + 3).classList.add("legal");
			}
			if (vmoves[i].san == "O-O-O") {
				document.getElementById(nfrom - 4).classList.add("legal");
			}
		}
	}
}

function updatePosition() {
	if (my_engine) {
		updateEngine(my_engine);
	}
	resetSquares();
	buildFromFEN();
	colorLastMove();
}

function buildFromFEN() {
	var pieces = chess.fen().split(" ")[0].split("");
	var j = 0;
	for (let i = 0; i < pieces.length; i++) {
		if (pieces[i] == "/") {
			continue;
		} else if (!isNaN(pieces[i])) {
			j += parseInt(pieces[i]);
		} else {
			setSquare(getSquare(j), pieces[i].toUpperCase());
			j++;
		}
	}
}

function resetSquares() {
	var squares = document.getElementsByClassName("square");
	for (let i = 0; i < squares.length; i++) {
		squares[i].firstChild.src = "assets/blank.svg";
		squares[i].classList.add("empty");
		squares[i].classList.remove("check");
		squares[i].classList.remove("prev-move");
	}
}

function colorLastMove() {
	if (curr_head.san) {
		let from = document.getElementById("" + getSquareNum(curr_head.from));
		let to = document.getElementById("" + getSquareNum(curr_head.to));
		from.classList.add("prev-move");
		to.classList.add("prev-move");
	}
}

export function undoMove() {
	if (curr_head.from != null) {
		curr_head = curr_head.prev;
		updateMoveList(curr_head);
		chess.undo();
		updatePosition();
	}
}

export function redoMove() {
	if (curr_head.next != null) {
		curr_head = curr_head.next;
		updateMoveList(curr_head);
		chess.move(curr_head.san);
		updatePosition();
	} else {
		doBestMove();
	}
}

function flipBoard() {
	DIR *= -1;
	makeBoard(DIR);
}

function submitFEN() {
	var fen_input = document.getElementById("fen-input");
	chess.load(fen_input.value);
	updatePosition();
	updateMoveList();
	sel = -1;
	updateSelection();
	fen_input.value = "";
}

function makeBoard(dir) {
	var board = document.getElementById("board");
	board.textContent = "";
	for (let i = 0; i < 64; i++) {
		board.appendChild(makeSquare(i, dir));
	}
	updatePosition();
}

function makeSquare(num, dir) {
	var sq = document.createElement("div");
	var piece_img = document.createElement("img");
	var crop_div = document.createElement("div");
	var shader_div = document.createElement("div");
	crop_div.className = "crop-div";
	shader_div.className = "shader";
	crop_div.appendChild(shader_div);
	sq.append(piece_img, crop_div);
	sq.classList.add("square", "empty");
	sq.classList.add((num + Math.floor(num / 8)) % 2 ? "dark" : "light");
	sq.id = dir == 1 ? num : 63 - num;
	sq.addEventListener("mousedown", doClick);
	sq.addEventListener("touchstart", doClick);
	return sq;
}

function LinkedToList(my_head) {
	var my_list = [];
	var new_head = my_head;
	while (new_head.prev) {
		new_head = new_head.prev;
	}
	while (new_head.next) {
		new_head = new_head.next;
		my_list.push(new_head);
	}
	return my_list;
}

export function getState() {
	return chess;
}

export function setEngine(engine) {
	my_engine = engine;
}

/********************************* CONSTANTS *********************************/
export const FILE_MAP = {
	0: "a",
	1: "b",
	2: "c",
	3: "d",
	4: "e",
	5: "f",
	6: "g",
	7: "h",
};

export const FILE_MAP_REV = {
	a: 0,
	b: 1,
	c: 2,
	d: 3,
	e: 4,
	f: 5,
	g: 6,
	h: 7,
};

export const RANK_MAP = {
	0: "8",
	1: "7",
	2: "6",
	3: "5",
	4: "4",
	5: "3",
	6: "2",
	7: "1",
};

export const RANK_MAP_REV = {
	8: 0,
	7: 1,
	6: 2,
	5: 3,
	4: 4,
	3: 5,
	2: 6,
	1: 7,
};

/********************************** CLASSES **********************************/
class Node {
	constructor(from, to, san) {
		this.from = from;
		this.to = to;
		this.san = san;
		this.next = null;
		this.prev = null;
	}

	addItem(f, t, s) {
		this.next = new Node(f, t, s);
		this.next.prev = this;
	}
}

/*********************************** MAIN ************************************/
const chess = new Chess();
var sel = -1;
var DIR = 1;
var curr_head = new Node(null, null, null);
var my_engine = null;
var move_list = document.getElementById("move-list");
var undo_button = document.getElementById("undo-button");
var redo_button = document.getElementById("redo-button");
var flip_button = document.getElementById("flip-button");
var fen_submit = document.getElementById("fen-submit");
undo_button.addEventListener("click", undoMove);
redo_button.addEventListener("click", redoMove);
flip_button.addEventListener("click", flipBoard);
fen_submit.addEventListener("click", submitFEN);
makeBoard(DIR);
