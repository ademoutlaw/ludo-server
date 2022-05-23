import { CELLS, COLORS } from './config.js';
import Timer from './timer.js';

import Stable from './stables.js';
const $board = document.getElementById('board');
const $home = document.getElementById('home');
const $home2 = document.getElementById('home2');

export default class Game {
	constructor(socket) {
		this.socket = socket;
		this.$cells = [];
		this.path = [];
		this.stables = [];
		this.players = []; // players colors
		this.index = -1; // my index in the game

		this.eventListener = new Map(); // map key: event name, value: method

		this.events = []; // events stack
		this.isAnimationEnd = true;
		this.toAnimated = true;
		this.timer = new Timer(this);
		this.bind();
		this.init();
	}

	bind() {
		this.setTurn = this.setTurn.bind(this);
		this.setAllowed = this.setAllowed.bind(this);
		this.rollDice = this.rollDice.bind(this);
		this.moveHorse = this.moveHorse.bind(this);
		this.onInit = this.onInit.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
		this.onUpdateDates = this.onUpdateDates.bind(this);
	}
	init() {
		console.log('to call loop next frame');
		this.initEventListener();
		this.initSocket();
		// this.socket.on('danger', this.onDanger.bind(this));
		this.initPath();
		this.initStables();
		this.initTargets();
		this.timer.start();
	}
	initEventListener() {
		this.eventListener.set('setTurn', this.setTurn);
		this.eventListener.set('setAllowed', this.setAllowed);
		this.eventListener.set('rollDice', this.rollDice);
		this.eventListener.set('moveHorse', this.moveHorse);
	}
	initSocket() {
		this.socket.on('init', this.onInit);
		this.socket.on('update', this.onUpdate);
		this.socket.on('updateDates', this.onUpdateDates);
	}

	initPath() {
		this.$cells = [];
		const $cells = document.getElementById('cells');
		for (const cell of CELLS) {
			const $cell = document.createElement('span');
			$cells.appendChild($cell);
			if (cell) {
				$cell.className = cell.type;
				if (typeof cell.color == 'number') {
					$cell.classList.add('color' + cell.color);
				}
				if (cell.type == 'arrow') {
					$cell.classList.add(cell.dir);
				}
				this.$cells.push($cell);
			} else {
				$cell.className = 'hide';
				this.$cells.push(null);
			}
		}
	}
	initStables() {
		console.log('init stable');
		this.stables = [];
		for (let index = 0; index < 4; index++) {
			this.stables.push(new Stable(index, this));
		}
	}
	initTargets() {
		this.$targets = [];
		const $targets = document.createElement('div');
		for (let index = 0; index < 4; index++) {
			const $target = document.createElement('div');
			$target.className = 'target';
			$targets.appendChild($target);
			this.$targets.push($target);
		}
		const $targetsSection = document.getElementById('targets');
		const $targetsContainer = document.createElement('div');
		$targetsContainer.className = 'targets-container';
		$targets.className = 'targets';
		$targetsContainer.appendChild($targets);
		$targetsSection.appendChild($targetsContainer);
	}
	initColors() {
		console.error(COLORS);
		console.error(this.players);
		for (let i = 0; i < 4; i++) {
			const color = COLORS[this.players[(i + this.index) % 4]];
			console.error((i + this.index) % 4, color);
			document.documentElement.style.setProperty('--color' + i, COLORS[this.players[(i + this.index) % 4]]);
		}
		// for (let i = 0; i < 15 * 15; i++) {
		// 	const cell = CELLS[i];
		// 	if (typeof cell?.color == 'number') {
		// 		this.$cells[i].classList.remove('uknown-color');
		// 		this.$cells[i].classList.add(COLORS[this.players[(cell.color + this.index) % 4]]);
		// 	}
		// }

		// for (let i = 0; i < 4; i++) {
		// 	this.stables[i].color = this.players[(i + this.index) % 4];
		// }
		// for (let i = 0; i < 4; i++) {
		// 	this.$targets[i].classList.replace('uknown-color', COLORS[this.players[(TARGETS_POSITIONS[i] + this.index) % 4]]);
		// }
	}
	computePathPositions() {
		this.path = [];
		for (let row = 0; row < 15; row++) {
			for (let col = 0; col < 15; col++) {
				const $cell = this.$cells[transpose(row, col, this.index)];
				if ($cell) {
					const { x, y } = $cell.getBoundingClientRect();
					this.path.push({ x, y });
				} else {
					this.path.push(null);
				}
			}
		}
		function transpose(row, col, index) {
			for (let i = 0; i < index; i++) {
				const prevRow = row;
				row = 14 - col;
				col = prevRow;
			}
			return row * 15 + col;
		}
	}
	onInit(data) {
		console.error('in init');
		this.players = data.players;
		this.index = data.index;
		this.events = [
			{
				turn: data.turn,
				name: 'setTurn',
				ignoreAnimation: true,
			},
		];
		$home.classList.add('hide');
		$home2.classList.add('hide');
		setTimeout(() => {
			this.initColors();
			$board.classList.remove('load');
		}, 4000);
		this.computePathPositions();
	}
	onUpdate(data) {
		console.log('update', data);
		this.completeAnimation();
		for (const event of data) {
			//TODO: validate event
			if (event) {
				this.events.push(event);
			}
		}
	}
	onUpdateDates(data) {
		const now = Date.now();
		const diff = data.updatedAt - now;
		const originalAutoPlayAtDiff = data.autoPlayAt - data.updatedAt;
		const testAutoPlayAtDiff = data.autoPlayAt - now;
		const autoPlayAtDiff = originalAutoPlayAtDiff + diff;
		const autoPlayAt = originalAutoPlayAtDiff + now;
		const nowD = new Date(now);
		const onowD = new Date(data.updatedAt);
		const autoPlayAtD = new Date(autoPlayAt);
		const oautoPlayAtD = new Date(data.autoPlayAt);
		console.log({
			data,
			now,
			diff,
			originalAutoPlayAtDiff,
			testAutoPlayAtDiff,
			autoPlayAt,
			autoPlayAtDiff,
			nowD,
			autoPlayAtD,
			onowD,
			oautoPlayAtD,
		});
	}

	update() {
		// this.updatetSchedule()
		const event = this.events[0];
		if (event && (event.ignoreAnimation || this.isAnimationEnd)) {
			this.events.shift();
			this.eventListener.get(event.name)(event);
			return;
		}
	}
	endAniamation() {
		this.isAnimationEnd = true;
	}
	completeAnimation() {
		this.toAnimated = false;
		while (this.events.length) {
			this.isAnimationEnd = true;
			this.update();
		}
		this.toAnimated = true;
		this.isAnimationEnd = true;
	}

	setTurn({ turn }) {
		this.isAnimationEnd = true;
		for (const stable of this.stables) {
			stable.setTurn(false);
		}
		this.getStable(turn).setTurn(true);
	}

	setAllowed({ turn, allowed }) {
		this.isAnimationEnd = true;
		this.getStable(turn).blinkHorses(allowed);
	}

	rollDice({ turn, dice }) {
		this.isAnimationEnd = false;
		this.getStable(turn).rollDice(dice);
	}
	moveHorse({ turn, horse, path, direction }) {
		this.setTurn({ turn });
		this.isAnimationEnd = false;
		this.getStable(turn).moveHorse({
			horse,
			path: (path || []).map(index => this.path[index]),
			direction,
			toAnimated: this.toAnimated,
		});
	}

	getStable(turn) {
		return this.stables[(turn - this.index + 4) % 4];
	}

	emitRollDice() {
		this.socket.emit('rollDice');
	}
	emitSelectHorse(horse) {
		this.socket.emit('selectHorse', horse);
	}
}
