angular.module('Game')
	.service('Server', function Server($http, $rootScope) {

		var ws = null;
		var flags = {
			isConnected: false,
			isInRoom: false,
			isCurrentTurn: false,
		};

		var data = {
			room: null,
			self: null,
			opponent: null
		};

		function connect() {
			reset();

			ws = new WebSocket('ws://127.0.0.1:8080');
			ws.addEventListener('open', onSocketOpen);
			ws.addEventListener('message', onSocketMessage);
			ws.addEventListener('close', onSocketClose);
		}

		function reset() {
			flags.isConnected = false;
			flags.isInRoom = false;
			flags.isCurrentTurn = false;

			data.room = null;
			data.self = null;
			data.opponent = null;

			if(!ws) return;

			ws.close();
			ws = null;
		}

		function onSocketOpen(event) {
			flags.isConnected = true;
			emit('connected', event);
		}

		function onSocketMessage(event) {

			var payload = JSON.parse(event.data);

			console.log("[ >> ] ", payload);

			switch(payload.cmd) {
				case "room_data": return setupRoomData(payload);
				case "self_data": return setupSelfData(payload);
				case "opponent_data": return setupOpponentData(payload);
			}

			emit(payload.cmd, payload);

		}

		function onSocketClose(event) {
			emit('disconnected', event);
		}

		function emit(event, parameters) {
			$rootScope.$broadcast('Server::' + event, parameters);
		}

		function on(event, callback) {
			$rootScope.$on('Server::' + event, callback);
		}

		function send(command, payload) {
			if(!payload) payload = {};

			payload.cmd = command;
			console.log("[ << ] ", payload);

			var serialized = JSON.stringify(payload);

			ws.send(serialized);
		}

		return {
			isConnected: function() { return flags.isConnected; },
			isInRoom: function() { return flags.isInRoom; },
			isCurrentTurn: function() { return flags.isCurrentTurn; },
			getRoom: function() { return data.room; },
			getSelf: function() { return data.self; },
			getOpponent: function() { return data.opponent; },
			send: send,
			on: on,
		}

	});