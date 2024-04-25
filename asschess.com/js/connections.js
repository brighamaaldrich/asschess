async function clickHandler() {
	await Buttplug.buttplugInit();
	var client = new Buttplug.ButtplugClient("Chess Beads Client");
	client.addListener("deviceadded", async (device) => {
		await addDevice(device);
	});
	client.addListener("scanningfinished", async () => {
		console.log("Scanning Finished");
	});
	await connectButtplug(client);
	await client.startScanning();
}

async function connectButtplug(client) {
	try {
		if ("bluetooth" in navigator) {
			await client.connect(
				new Buttplug.ButtplugEmbeddedConnectorOptions()
			);
		} else {
			const connector = new Buttplug.ButtplugWebsocketConnectorOptions();
			connector.Address = "ws://127.0.0.1:12345/buttplug";
			await client.connect(connector);
			client.addListener("deviceadded", async (device) => {
				await new Promise((r) => setTimeout(r, 150));
				await client.stopScanning();
			});
		}
	} catch (e) {
		console.log(e);
		return;
	}
}

async function addDevice(device) {
	var ul = document.getElementById("devices");
	var li = document.createElement("li");
	var li_name = document.createElement("p");
	var button = document.createElement("button");
	var input = document.createElement("input");
	var right = document.createElement("div");
	right.appendChild(input);
	right.appendChild(button);
	li.appendChild(li_name);
	li.appendChild(right);
	ul.appendChild(li);
	right.classList.add("device-right");
	li.classList.add("device");
	li_name.classList.add("device-name");
	input.classList.add("move-input");
	button.classList.add("move-button");
	button.innerHTML = "Send";
	button.addEventListener("click", async () => {
		let move = getMove();
		if (move) {
			await sendMove(move, device);
		}
	});
	input.placeholder = "Ex: e2 e4";
	input.name = "input";
	li_name.innerHTML = device.Name;
}

async function sendMove(move, device) {
	var codes = moveToBinary(move);
	console.log(move, codes);
	for (let i = 0; i < codes.length; i++) {
		for (let j = 0; j < codes[i].length; j++) {
			if (codes[i].charAt(j) == "0") {
				await device.vibrate(0.4);
				await new Promise((r) => setTimeout(r, 250));
			} else if (codes[i].charAt(j) == "1") {
				await device.vibrate(0.4);
				await new Promise((r) => setTimeout(r, 1300));
			}
			await device.stop();
			await new Promise((r) => setTimeout(r, 400));
		}
		await new Promise((r) => setTimeout(r, 800));
	}
}

function getMove() {
	var input = document.getElementsByClassName("move-input")[0];
	var last_move = document.getElementsByClassName("curr-move")[0];
	var move;
	if (/^([a-h][1-8])\s*([a-h][1-8])$/.test(input.value)) {
		move = input.value;
		move = move.substring(0, 2) + " " + move.substring(move.length - 2);
		input.value = "";
	} else if (last_move != null) {
		move = last_move.id;
	}
	return move;
}

function moveToBinary(move) {
	var startSquare = move.substring(0, 2);
	var endSquare = move.substring(3);
	var startX = startSquare.charCodeAt(0) - "a".charCodeAt(0);
	var startY = parseInt(startSquare[1]) - 1;
	var endX = endSquare.charCodeAt(0) - "a".charCodeAt(0);
	var endY = parseInt(endSquare[1]) - 1;
	var startXBinary = startX.toString(2).padStart(3, "0");
	var startYBinary = startY.toString(2).padStart(3, "0");
	var endXBinary = endX.toString(2).padStart(3, "0");
	var endYBinary = endY.toString(2).padStart(3, "0");
	return [startXBinary, startYBinary, endXBinary, endYBinary];
}

document.getElementById("buttplug-websocket-button").onclick = () =>
	clickHandler();
