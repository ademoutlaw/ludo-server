export default class Dice {
	constructor(stable) {
		this.stable = stable;
		this.$dice = document.getElementById('dice').content.firstElementChild.cloneNode(true);
		const $dice = document.createElement('div');
		$dice.className = 'dice-container';
		$dice.appendChild(this.$dice);
		stable.$stable.appendChild($dice);

		if (stable.isReactive) {
			$dice.className = 'dice-container reactive';
			$dice.addEventListener('click', this.click.bind(this));
		}
		this.$dice.firstElementChild.addEventListener('transitionend', this.end.bind(this));
	}
	roll(nbr) {
		this.$dice.classList.toggle('odd-roll');
		this.$dice.classList.toggle('even-roll');
		this.$dice.dataset.roll = nbr;
		// console.log(this);
		// if (!this.game.toRollDice) return;
		// console.log('object');
		// this.value = 6;
		// this.game.toRollDice = false;
		// this.game.toMove = true;
	}

	click() {
		console.log('!!!');
		this.stable.game.emitRollDice();
	}
	end() {
		this.stable.game.endAniamation();
	}
}
