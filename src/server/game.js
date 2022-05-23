const { Socket } = require('socket.io');
const { v4: uuid } = require('uuid');

const { moveHorse, rollDice, getAllowedHorses } = require('./raceway');
const { computeEventDates } = require('./dates');
const { getRandomHorse } = require('./auto');

function randomItem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

class Game {
	constructor() {
		this.id = uuid();
		this.players = [];
		this.player = null;
		this.inDangerAt = Infinity;
		this.autoPlayAt = Infinity;
		this.colors = [-1, -1, -1, -1];
		this.state = 'WAIT';
		this.allowedHorses = [];
		this.notBefore = 0;
		this.updatedAt = 0;
	}
	get isWaiting() {
		return this.state == 'WAIT';
	}
	get isStartListen() {
		return this.notBefore <= this.updatedAt;
	}
	/**
	 *
	 * @param {Socket} socket
	 */
	join(socket, data) {
		socket.gameId = this.id;
		const index = this.players.length;
		this.players.push({ socket, ...data, index, horses: [-1, -1, -1, -1], headway: 0 });
		this.colors[data.color] = index;
		this.wait();
		if (this.players.length == 4) {
			console.log('to set time');
			setTimeout(() => {
				console.log('to init');
				this.init();
			}, 5000);
		}
		this.dice = 0;

		socket.on('rollDice', () => {
			this.rollDice(index);
		});
		socket.on('selectHorse', horse => {
			this.selectHorse(index, horse);
		});
	}
	init() {
		this.player = this.players[0];
		this.state = 'roll';
		this.maxDelay = 20000;
		this.emit('init', ({ index }) => ({ index, players: [...this.colors], turn: this.player.index }));
		this.updateEventDates([{ name: 'init' }]);
		// this.test();
	}
	wait() {
		const players = [];
		for (const { index, color, name } of this.players) {
			players.push({ index, color, name });
		}
		this.emit('wait', () => ({ players, id: this.id }));
	}

	leave(socket) {
		const players = [];
		for (const player of this.players) {
			if (player.socket == socket) {
				this.colors[player.color] = -1;
				continue;
			}
			players.push(player);
		}
		this.players = players;
		this.wait();
		// if (this.players.length == 1) {
		// 	this.players[0].socket.emit('win');
		// }
		return this.players.length == 0;
	}
	canJoin(color) {
		return this.colors[color] == -1;
	}
	loop(now) {
		this.updatedAt = now;
		this.autoPlay();
	}
	rollDice(turn) {
		if (!this.isStartListen || this.state != 'roll' || turn != this.player?.index) return;
		const { data } = this._rollDice();
		this.emit('update', data);
		this.updateEventDates(data);
	}
	_rollDice() {
		this.dice = rollDice(this.player.horses);
		this.allowedHorses = getAllowedHorses(this.player.horses, this.dice);

		console.log('!!---------------------------------');
		console.log('---------------------------------');
		console.log('allowed', this.allowedHorses);

		const data = [{ name: 'rollDice', turn: this.player.index, dice: this.dice }];
		let isChangedTurn = false;
		if (this.allowedHorses.length) {
			let samePos = true;
			for (let i = 1; i < this.allowedHorses.length; i++) {
				if (this.player.horses[this.allowedHorses[i]] != this.player.horses[this.allowedHorses[0]]) {
					samePos = false;
					break;
				}
			}

			if (samePos) {
				data.push(...this.moveHorse(this.allowedHorses[0]));
				isChangedTurn = true;
			} else {
				this.state = 'select';
				data.push({ name: 'setAllowed', turn: this.player.index, allowed: this.allowedHorses });
			}
		} else {
			this.player = this.players[(this.player.index + 1) % 4];
			data.push({ name: 'setTurn', turn: this.player.index });
			isChangedTurn = true;
		}
		console.log('---------------------------------!!');
		return { data, isChangedTurn };
	}
	selectHorse(turn, horse) {
		console.log(turn, horse);
		if (!this.isStartListen || this.state != 'select' || turn != this.player?.index || !this.allowedHorses.includes(horse)) return;
		const data = this.moveHorse(horse);
		this.emit('update', data);
		this.updateEventDates(data);
	}
	moveHorse(horseIndex) {
		console.log('allowed0', 0);
		this.state = 'roll';
		const { path, deadHorse } = moveHorse({
			horseIndex,
			playerIndex: this.player.index,
			players: this.players,
			dice: this.dice,
		});
		if (!path) {
			this.player = this.players[(this.player.index + 1) % 4];

			return [{ name: 'setTurn', turn: this.player.index }];
		}
		console.log('path', path);
		this.player.horses[horseIndex] = path[path.length - 1];
		this.player.headway += path.length;
		const data = [{ name: 'moveHorse', turn: this.player.index, horse: horseIndex, path, direction: 'forward' }];
		if (deadHorse) {
			this.players[deadHorse.player].horses[deadHorse.index] = -1;
			this.players[deadHorse.player].headway = 0;
			data.push({ name: 'moveHorse', turn: deadHorse.player, horse: deadHorse.index, direction: 'backward' });
		} else if (this.dice < 6) {
			this.player = this.players[(this.player.index + 1) % 4];
		}
		data.push({ name: 'setTurn', turn: this.player.index });

		return data;
	}
	autoPlay() {
		if (this.autoPlayAt > this.updatedAt) return;
		let events = null;
		if (this.state == 'select') {
			events = this.moveHorse(randomItem(this.allowedHorses));
		} else if (this.state == 'roll') {
			const { data, isChangedTurn } = this._rollDice();
			if (!isChangedTurn && this.allowedHorses.length) {
				data.push(...this.moveHorse(randomItem(this.allowedHorses)));
			}
			events = data;
		}
		if (events) {
			this.emit('update', events);
			this.updateEventDates(events);
		}
	}
	emit(event, cbOrData) {
		for (const player of this.players) {
			if (typeof cbOrData == 'function') {
				player.socket.emit(event, cbOrData(player));
			} else {
				player.socket.emit(event, cbOrData);
			}
		}
	}
	updateEventDates(events) {
		console.log('update dates', events);
		const dates = computeEventDates(this.updatedAt, events, this.players);
		this.notBefore = dates.notBefore;
		this.inDangerAt = dates.inDangerAt || this.inDangerAt;
		this.autoPlayAt = dates.autoPlayAt || this.autoPlayAt;

		this.emit('updateDates', {
			updatedAt: this.updatedAt,
			notBefore: this.notBefore,
			inDangerAt: this.inDangerAt,
			autoPlayAt: this.autoPlayAt,
		});
	}
}

module.exports = Game;
