const { Server, Socket } = require('socket.io');
const Game = require('./game');

const games = {};

function getGame(color) {
	let waitingGames = 0;
	for (const game of Object.values(games)) {
		if (game.isWaiting) {
			waitingGames++;
		}
		if (game.canJoin(color)) {
			return game;
		}
	}
	if (waitingGames >= 10) return null;
	const game = new Game();
	games[game.id] = game;
	return game;
}

function loop() {
	const now = Date.now();
	for (const game of Object.values(games)) {
		game.loop(now);
	}
	setTimeout(loop, 1000);
}
loop();
module.exports = function connect(server) {
	const io = new Server(server);
	io.on('connection', socket => {
		console.log('connection');
		console.log('connect');
		socket.on('join', data => {
			console.log('game', socket.gameId);
			const game = getGame(data.color, socket.gameId);
			if (!game) {
				socket.emit('changeColor');
				return;
			}

			console.log('game', game);
			game.join(socket, data);
			console.log(socket.gameId);
			// const none = nbr => {
			// 	return new Array(nbr).fill(0).map(() => ({}));
			// };
			// const emit = data => {
			// 	setTimeout(() => {
			// 		const { event, payload } = data.shift();
			// 		if (event) {
			// 			socket.emit(event, payload);
			// 		}
			// 		if (data.length) emit(data);
			// 	}, 7000);
			// };
			// emit([
			// 	{ event: 'init', payload: { index: 2, players: [1, 2, 3, 0], nextTurn: 0 } },
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 0, dice: 6, allowed: [0, 1, 2, 3] },
			// 			{ name: 'moveHorse', turn: 0, horse: 2, path: [201], direction: 'forward' },
			// 			{ name: 'setTurn', turn: 0 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 0, dice: 6 },
			// 			{ name: 'setAllowed', turn: 0, allowed: [0, 1, 2, 3] },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'moveHorse', turn: 0, horse: 2, path: [186, 171, 156, 141, 125, 124], direction: 'forward' },
			// 			{ name: 'setTurn', turn: 0 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 0, dice: 1, allowed: [2] },
			// 			{ name: 'moveHorse', turn: 0, horse: 2, path: [123], direction: 'forward' },
			// 			{ name: 'setTurn', turn: 1 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 1, dice: 1 },
			// 			{ name: 'setTurn', turn: 2 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 2, dice: 1 },
			// 			{ name: 'setTurn', turn: 3 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 3, dice: 6, allowed: [0, 1, 2, 3] },
			// 			{ name: 'moveHorse', turn: 3, horse: 2, path: [201], direction: 'forward' },
			// 			{ name: 'setTurn', turn: 3 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 3, dice: 6, allowed: [0, 1, 2, 3] },
			// 			{ name: 'moveHorse', turn: 3, horse: 2, path: [186, 171, 156, 141, 125, 124], direction: 'forward' },
			// 			{ name: 'setTurn', turn: 3 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 3, dice: 1, allowed: [2] },
			// 			{ name: 'moveHorse', turn: 3, horse: 2, path: [123], direction: 'forward' },
			// 			{ name: 'moveHorse', turn: 0, horse: 2, direction: 'backward' },
			// 			{ name: 'setTurn', turn: 3 },
			// 		],
			// 	},
			// 	{
			// 		event: 'update',
			// 		payload: [
			// 			{ name: 'rollDice', turn: 3, dice: 2, allowed: [2] },
			// 			{ name: 'moveHorse', turn: 3, horse: 2, path: [122, 121], direction: 'forward' },
			// 			{ name: 'setTurn', turn: 0 },
			// 		],
			// 	},

			// 	{ event: 'moveHorse', payload: [{ turn: 0, horse: 2, path: [201], direction: 'forward', nextTurn: 0 }] },
			// 	{ event: 'rollDice', payload: [{ turn: 0, dice: 6, allowed: [0, 1, 2, 3], nextTurn: 0 }] },
			// 	{
			// 		event: 'moveHorse',
			// 		payload: [{ turn: 0, horse: 2, path: [186, 171, 156, 141, 125, 124], direction: 'forward', nextTurn: 0 }],
			// 	},
			// 	{ event: 'rollDice', payload: { turn: 0, dice: 2, allowed: [2], nextTurn: 0 } },
			// 	{
			// 		event: 'moveHorse',
			// 		payload: [{ turn: 0, horse: 2, path: [123, 122], direction: 'forward', nextTurn: 1 }],
			// 	},
			// 	{ event: 'rollDice', payload: { turn: 1, dice: 4, allowed: null, nextTurn: 2 } },
			// 	...none(9),
			// 	{ event: 'danger', payload: { turn: 2 } },
			// 	// { event: 'moveHorse', payload: [{ turn: 1, horse: 0, path: [201], direction: 'forward', nextTurn: 1 }] },
			// 	// {
			// 	// 	event: 'moveHorse',
			// 	// 	payload: [
			// 	// 		{ turn: 1, horse: 0, path: [186, 171, 156, 141, 125, 124], direction: 'forward', nextTurn: 1 },
			// 	// 		{ turn: 0, horse: 2, direction: 'backward', nextTurn: 1 },
			// 	// 	],
			// 	// },
			// ]);
			// socket.on('rollDice', () => {
			// 	socket.emit('rollDice', { index: random(0, 3), dice: random(1, 6), turn: 3 });
			// });
		});
		socket.on('disconnect', () => {
			console.log('disconnect5', socket.gameId);
			if (socket.gameId && games[socket.gameId]) {
				const toClear = games[socket.gameId].leave(socket);
				if (toClear) {
					delete games[socket.gameId];
				}
			}
		});
	});
	loop();
};

function random(min, max) {
	return Math.floor(Math.random() * (max + 1 - min)) + min;
}
