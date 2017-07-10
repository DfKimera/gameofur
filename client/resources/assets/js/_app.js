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