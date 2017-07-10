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