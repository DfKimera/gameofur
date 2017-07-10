const WebSocket = require('ws');
const uuid = require('uuid/v1');

let wss = null;
let players = null;
let rooms = null;

function init() {
	players = {};
	rooms = {
		'lobby': {id: 'lobby'}
	};

	console.log("Game of Ur - Server");
	console.log("Starting websocket server...");

	wss = new WebSocket.Server({ port: 8080 });
	wss.on('connection', onClientConnect);

	console.log("Now listening to port 8080!");
}

function registerPlayer(socket) {
    let id = uuid();

    players[id] = {
        id: id,
        room: rooms.lobby,
        socket: socket
    }
}

function getPlayer(id) {
    if(!players[id]) return null;
    return players[id];
}

function getRoom(roomID) {
    if(!rooms[id]) return null;
    return rooms[id];
}

function assignToRoom(player, roomID) {
    if(!rooms[roomID]) {
        console.error("[assignToRoom] Invalid room ID: ", roomID);
        return null;
    }

    player.room = rooms[roomID];
    rooms[roomID].players[player.id] = player;

    console.log("[assignToRoom] Assigned player ", player.id, ' to room: ', roomID);
}

function createRoom() {
    let id = uuid();
    rooms[id] = {
        id: id,
        players: {}
    };

    console.log("[createRoom] Room created: ", id);

    return rooms[id];
}

function numPlayersInRoom(roomID) {
    return players.reduce((carry, player) => {
        return (player.room && player.room.id === roomID);
    });
}

function canJoinRoom(player, roomID) {
    if(!rooms[roomID]) return false;
    return (numPlayersInRoom(roomID) >= 2);
}

function cmdSetPlayerNickname(player, message) {

    player.nickname = message.nickname;

    console.log("[nickname_changed] <" + player.id + "> Set nickname to: " + player.nickname);

    broadcast(player.room, {
        event: 'nickname_changed',
        player_id: player.id,
        nickname: player.nickname
    });

}

function cmdSendChat(player, message) {

    console.log("[chat] <" + player.room.id + "> [" + player.nickname + "] " + message.message);

    broadcast(player.room, {
        event: 'chat_message',
        player_id: player.id,
        nickname: player.nickname,
        message: message.message
    });
}

function cmdUnknown(player, message) {
    console.error("[unknown_command] <" + player.room.id + " : " + player.id + "> Unknown command: ", message);
}

function onMessageReceived(player, payload) {

    let message = JSON.parse(payload);

    if(!message.cmd) {
        console.warn("[event.message] <" + player.id + "> Invalid message: ", payload);
        return;
    }

    switch(message.cmd) {

    	// TODO: implement commands

        case "set_nickname": return cmdSetPlayerNickname(player, message);
        //case "skip_turn": return cmdSkipTurn(player, message);
        //case "preview_move": return cmdPreviewMove(player, message);
        //case "perform_move": return cmdPerformMove(player, message);
        //case "forfeit": return cmdForfeit(player, message);
        case "send_chat": return cmdSendChat(player, message);
        //case "roll_dice": return cmdRollDice(player, message);

        default: return cmdUnknown(player, message);

    }

}

function send(player, message) {
    if(!player) return;
    if(!player.socket) return;

    let payload = JSON.encode(message);

    console.log("[send] <" + player.id + "> -> ", payload);

    player.socket.send(payload);
}

function broadcast(room, message) {
    if(!room) return;
    if(!room.players) return;

    console.log("[broadcast] <" + room.id + " (" + Object.keys(room.players).length + ")> -> ", payload);

    for(let playerID in room.players) {
        if(!room.players.hasOwnProperty(playerID)) continue;
        room.players[playerID].socket.send(JSON.encode(message));
    }
}

function onClientConnect(ws) {

	let player = registerPlayer(ws);

	console.log("[event.connection] Player connected: ", player.id);

	ws.on('message', function (message) {
		onMessageReceived(player, message);
	});

	send(player, {cmd: 'send_meta'})
}

init();