angular
	.module("Game", [
		'ngRoute'
	])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/board', {
				controller: 'BoardCtrl',
				templateUrl: 'game.html'
			})
			.when('/matchmaking', {
				controller: 'MatchmakingCtrl',
				templateUrl: 'matchmaking.html'
			})
			.otherwise({
				redirectTo: '/matchmaking'
			})
	});
const BOARD = [
	[
		{class: 'cell rosette', isRosette: true, next: [1,0], direction: 'down'},
		{class: 'cell', next: [0,0], direction: 'left'},
		{class: 'cell', next: [0,1], direction: 'left'},
		{class: 'cell start', next: [0, 2], start: 'white', direction: 'left'},
		{class: 'empty'},
		{class: 'empty'},
		{class: 'cell rosette end', isRosette: true, end: 'white', exit: [-1,6], direction: 'up'},
		{class: 'cell', next: [0,6], direction: 'left'}
	],
	[
		{class: 'cell', next: [1,1], direction: 'right'},
		{class: 'cell', next: [1,2], direction: 'right'},
		{class: 'cell', next: [1,3], direction: 'right'},
		{class: 'cell rosette', isRosette: true, next: [1,4], direction: 'right'},
		{class: 'cell', next: [1,5], direction: 'right'},
		{class: 'cell', next: [1,6], direction: 'right'},
		{class: 'cell', next: [1,7], direction: 'right'},
		{class: 'cell', split: true, next: {white: [0,7], black: [2,7]}, direction: {white: 'up', black: 'down'}}
	],
	[
		{class: 'cell rosette', isRosette: true, next: [1,0], direction: 'up'},
		{class: 'cell', next: [2,0], direction: 'left'},
		{class: 'cell', next: [2,1], direction: 'left'},
		{class: 'cell start', next: [2, 2], start: 'black', direction: 'left'},
		{class: 'empty'},
		{class: 'empty'},
		{class: 'cell rosette end', isRosette: true, end: 'black', exit: [3,6], direction: 'down'},
		{class: 'cell', next: [2,6], direction: 'left'}
	]
];
const CELL_SIZE = 80;
const PIECE_CELL_MARGIN = 20;

angular.module("Game")
    .filter('range', RangeFilter)
    .controller('BoardCtrl', BoardCtrl);

function RangeFilter() {
    return function(input, total) {
        total = parseInt(total);

        for (var i=0; i<total; i++) {
            input.push(i);
        }

        return input;
    };
}

function BoardCtrl($scope) {

    // TODO: move game logic to server
    // TODO: refactor local events to be sent to server
    // TODO: handle server events to move things in board

	var pieces = $scope.pieces = {
        white: [],
        black: []
    };

    var availablePieces = $scope.availablePieces = {
        white: 6,
        black: 6
    };

    var removedPieces = $scope.removedPieces = {
        white: 0,
        black: 0
    };

    var indexes = {
        white: 0,
        black: 0
    };

    var players = $scope.players = ['white', 'black'];

    var starts = $scope.starts = {
        white: null,
        black: null
    };

    var dice = $scope.dice = {
        white: 1,
        black: 1
    };

    $scope.previewedPiece = null;
    $scope.previewArrows = [];

    $scope.turn = "white";

    var board = $scope.board = createBoard();

    starts.white = findStartCell($scope.board, 'white');
    starts.black = findStartCell($scope.board, 'black');

    console.log("Starting cells: ", starts);

    $scope.startGame = function() {
        $scope.endTurn();
    };

    $scope.hasPieceInCell = function(cell) {
        if(!cell) return false;
        return !!cell.piece;
    };

    $scope.getPiecePlayer = function(cell) {
        if(!cell || !cell.piece) return null;
        return cell.piece.player;
    };

    $scope.getPieceX = getPieceX;
    $scope.getPieceY = getPieceY;

    $scope.addPiece = function(player) {

        if(player !== $scope.turn) {
            console.warn("Not the player ", player, " turn!");
            return;
        }

        if(dice[player] === 0) {
            console.warn("Cannot place pieces, dice is zero!");
            return;
        }

        if(availablePieces[player] <= 0) {
            console.warn("Player has no remaining available pieces: ", player);
            return;
        }

        var start = starts[player];

        console.log("Adding piece for player ", player, ", starting cell: ", start);

        if($scope.hasPieceInCell(start)) {
            console.warn("Can't add piece for [", player, "], piece already in starting cell!");
            return;
        }

        var piece = {
            id: ++indexes[player],
            cell: getCell(board, start.row, start.col),
            player: player,
            isAlive: true,
            isOut: false
        };

        pieces[player].push(piece);
        piece.cell.piece = piece;

        availablePieces[player]--;

        $scope.advancePiece(piece, dice[player] - 1);

        if(piece.cell.isRosette) {
            console.info("Landed on rosette! Got an extra turn");
            $scope.rollDice(player);
            return;
        }

        $scope.endTurn();
    };


    $scope.selectPiece = function(piece) {

        if(piece.player !== $scope.turn) {
            console.warn("Not the player ", piece.player, " turn!");
            return;
        }

        if(dice[piece.player] === 0) {
            console.warn("Cannot move pieces, dice is zero!");
            return;
        }

        if(angular.equals(piece, $scope.previewedPiece)) {
            $scope.advancePiece(piece, dice[piece.player]);

            if(piece.cell.isRosette) {
                console.info("Landed on a rosette! Extra move granted!");
                $scope.rollDice(piece.player);
                return;
            }

            $scope.endTurn();

            return;
        }

        $scope.previewMove(piece, dice[piece.player]);
    };

    $scope.endTurn = function() {
        $scope.turn = ($scope.turn === 'white') ? 'black' : 'white';
        console.info("Now it is ", $scope.turn, " turn!");
        $scope.rollDice($scope.turn);
    };

    $scope.rollDice = function(player) {
        dice[player] = Math.floor(Math.random() * 5);
        console.log("Rolled dice for ", player, ": ", dice[player]);
    };

    $scope.previewMove = function(piece, numCells) {
        var previews = [];
        var next = piece.cell;

        console.log("Preview move by piece: ", piece, numCells);

        // Traverse the cell chain until the target piece
        while(numCells-- > 0) {
            var prev = next;
            next = getNextCell(board, next, piece.player);

            if(!next) { // No more pieces in chain, means numCells overflows the board end
                console.warn("Can't advance piece, num cells overflow chain", piece, numCells);
                return;
            }

            // If the target piece (numCells == 0) is "end", means we leave the board with this piece and earn +1 score
            if(next === 'end' && numCells === 0) {

                previews.push({
                    y: (prev.exit[0] * CELL_SIZE),
                    x: (prev.exit[1] * CELL_SIZE),
                    direction: prev.direction
                });

                console.info("Preview result [endgame]: ", previews);

                $scope.previewedPiece = piece;
                $scope.previewArrows = previews;

                return;
            }

            var direction = prev.direction || 'right';
            if(prev.split) direction = prev.direction[piece.player];

            previews.push({y: next.row * CELL_SIZE, x: next.col * CELL_SIZE, direction: direction});
        }

        // If piece from same player, block move
        if(next.piece && next.piece.player === piece.player) {
            console.warn("Targeted cell already has piece: ", next.piece, next);
            return;
        }

        if(next.piece && next.isRosette) {
            console.warn("Targeted cell is safe cell, cannot move");
            return;
        }

        console.info("Preview result: ", previews);

        $scope.previewedPiece = piece;
        $scope.previewArrows = previews;
    };

    $scope.advancePiece = function(piece, numCells) {

        var next = piece.cell;

        console.log("Advancing piece: ", piece, numCells);

        // Traverse the cell chain until the target piece
        while(numCells-- > 0) {
            next = getNextCell(board, next, piece.player);

            if(!next) { // No more pieces in chain, means numCells overflows the board end
                console.warn("Can't advance piece, num cells overflow chain", piece, numCells);
                return;
            }

            // If the target piece (numCells == 0) is "end", means we leave the board with this piece and earn +1 score
            if(next === 'end' && numCells === 0) {
                console.info("One piece out: ", piece);

                piece.cell.piece = null;
                piece.cell = null;
                piece.isOut = true;

                removedPieces[piece.player]++;

                $scope.previewArrows = [];
                $scope.previewedPiece = null;

                return;

            }
        }

        // If piece in targeted cell is of other player, "eat" the piece
        if(next.piece && next.piece.player !== piece.player) {

            if(next.isRosette) {
                console.warn("Targeted cell is safe cell, cannot move");
                return;
            }

            availablePieces[next.piece.player]++;

            next.piece.isAlive = false;
            next.piece.cell = null;
            next.piece = null;
        }

        // If piece from same player, block move
        if(next.piece) {
            console.warn("Targeted cell already has piece: ", next.piece, next);
            return;
        }

        // Move piece to target cell
        piece.cell.piece = null;
        next.piece = piece;
        piece.cell = next;

        $scope.previewArrows = [];
        $scope.previewedPiece = null;
    };

	function createBoard() {

		var board = Object.assign({}, BOARD);

		for (var row in board) {
			if(!board.hasOwnProperty(row)) continue;

			for (var col in board[row]) {
				if(!board[row].hasOwnProperty(col)) continue;

				board[row][col].row = row;
				board[row][col].col = col;
				board[row][col].piece = null;
			}

		}

		return board;
	}

	function getCell(board, row, col) {
		return board[parseInt(row)][parseInt(col)];
	}

	function findStartCell(board, player) {
		for (var row in board) {
			if(!board.hasOwnProperty(row)) continue;

			for (var col in board[row]) {
				if(!board[row].hasOwnProperty(col)) continue;

				var cell = getCell(board, row, col);

				if(!cell.start) continue;
				if(cell.start !== player) continue;

				return cell;
			}
		}

		return null;
	}

	function getPieceX(piece) {
		if(!piece.cell) return 0;
		return (piece.cell.col * CELL_SIZE) + PIECE_CELL_MARGIN;
	}

	function getPieceY(piece) {
		if(!piece.cell) return 0;
		return (piece.cell.row * CELL_SIZE) + PIECE_CELL_MARGIN;
	}

	function getNextCell(board, cell, player) {

		if(cell.end === player) return 'end';

		if(!cell.next) return null;

		var coords = cell.split ?
			cell.next[player] :
			cell.next;

		if(!coords) return null;

		return getCell(board, coords[0], coords[1]);
	}

    // Always leave this at the end of the controller
    $scope.startGame();

}
angular.module("Game")
	.controller('MatchmakingCtrl', MatchmakingCtrl);

function MatchmakingCtrl($scope) {

	console.log("@ Matchmaking Controller");

	$scope.nickname = 'Guest_' + parseInt((Math.random()) * 1000);
	$scope.join = {
		room_id: ''
	};

	$scope.tryCreateRoom = function() {

	};

	$scope.tryJoinRoom = function() {

	};

}
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
//# sourceMappingURL=game.js.map
