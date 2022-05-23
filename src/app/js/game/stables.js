import Horse from './horse.js';
import Dice from './dice.js';
import { COLORS } from './config.js';

export default class Stable {
	constructor(index, game) {
		this.index = index;
		this.horses = [];
		this.game = game;
		this.$stable = document.createElement('div');
		this.$stable.className = 'stable';
		this._color = -1;

		this.horses = [];
		for (let index = 0; index < 4; index++) {
			this.horses.push(new Horse(index, this));
		}
		this.dice = new Dice(this);

		this.$stables = document.getElementById('stables');
		this.$stables.appendChild(this.$stable);
	}
	get isReactive() {
		return this.index == 0;
	}
	set color(_color) {
		const oldColor = this.color;
		this._color = _color;
		this.$stable.classList.replace(oldColor, this.color);
	}
	get color() {
		return this._color < 0 ? 'uknown-color' : COLORS[this._color];
	}
	moveHorse({ horse, path, direction, toAnimated }) {
		console.error('in stable move', [...path], direction, toAnimated);
		this.$stable.classList.remove('blink');
		this.$stable.classList.remove('start');
		this.$stable.classList.remove('danger');
		this.horses[horse].move(path, direction, toAnimated);
	}
	update() {
		for (const horse of this.horses) {
			horse.update();
		}
	}
	rollDice(dice) {
		this.$stable.classList.remove('blink');
		this.dice.roll(dice);
	}

	setTurn(isTurn) {
		if (isTurn) {
			this.$stable.classList.add('turn');
			this.$stable.classList.add('blink');
			this.$stable.classList.add('start');
		} else {
			this.$stable.classList.remove('turn');
			this.$stable.classList.remove('start');
			this.$stable.classList.remove('danger');
			this.$stable.classList.remove('blink');
			for (const horse of this.horses) {
				horse.blink(false);
			}
		}
	}

	blinkHorses(horses) {
		for (const horse of horses.map(h => this.horses[h])) {
			horse.blink(true);
		}
	}
}
