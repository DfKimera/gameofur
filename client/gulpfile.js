var elixir = require('laravel-elixir');
require('laravel-elixir-sass-compass');
require('laravel-elixir-wiredep');
require('laravel-elixir-bower');
require('laravel-elixir-serve');


elixir(function(mix) {

	mix.compass('game.sass', 'public/css', {
		modules: [],
		config_file: "config.rb",
		style: "expanded",
		sass: "resources/assets/sass",
		font: "public/fonts",
		image: "public/images",
		javascript: "public/js",
		sourcemap: true
	});

	mix.scriptsIn('resources/assets/libs*', "public/js/vendor.js");
	mix.scriptsIn('resources/assets/js*', 'public/js/game.js');

});