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