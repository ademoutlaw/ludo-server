export default class Horse {
	constructor(index, stable) {
		console.log('horse', index);
		this.index = index;
		this.stable = stable;
		this.isOut = false;
		this.path = [];
		this.movedPath = [];

		this.$horse = document.createElement('div');
		this.$horse.className = 'horse';

		const $horseContainer = document.createElement('div');
		$horseContainer.className = 'horse-container';
		$horseContainer.appendChild(this.$horse);

		stable.$stable.appendChild($horseContainer);

		this.$horse.addEventListener('transitionend', this.moveWithAnimation.bind(this));
		if (stable.isReactive) {
			this.$horse.addEventListener('click', this.select.bind(this));
		}
		requestAnimationFrame(() => {
			const { x, y, width, height } = this.$horse.getBoundingClientRect();
			this.width = width;
			this.height = height;
			this.baseX = x;
			this.baseY = y;
		});
	}

	move(path, direction, toAnimated) {
		if (direction == 'forward') {
			this.$horse.classList.add('jump');
			this.isOut = true;
			this.path = path;
			this.movedPath.push(...path);
		} else {
			this.isOut = false;
			this.movedPath.shift();
			this.path = [
				...this.movedPath,
				{
					x: this.baseX,
					y: this.baseY,
				},
			];
			this.movedPath = [];
			this.$horse.classList.add('fast');
		}
		if (toAnimated) {
			this.moveWithAnimation();
		} else {
			this.moveWithoutAnimation();
		}
	}
	moveWithAnimation() {
		const pos = this.path.shift();
		if (!pos) {
			this.stable.game.endAniamation();
			this.$horse.classList.remove('fast');
			this.$horse.classList.remove('jump');
			this.$horse.classList.remove('jump2');
			return;
		}
		this.$horse.style.transform = `translate(${pos.x - this.baseX}px,${pos.y - this.baseY}px)`;
		if (this.isOut) {
			this.$horse.classList.toggle('jump');
			this.$horse.classList.toggle('jump2');
		}
	}
	moveWithoutAnimation() {
		if (this.isOut) {
			const pos = this.path.pop();
			this.$horse.style.transform = `translate(${pos.x - this.baseX}px,${pos.y - this.baseY}px)`;
		} else {
			this.$horse.style.transform = null;
		}
		this.path = [];
	}
	blink(flag) {
		// console.error('in horse blink', flag);
		if (flag) {
			this.$horse.classList.add('blink');
		} else {
			this.$horse.classList.remove('blink');
		}
	}
	select() {
		console.log('select !!!');
		this.stable.game.emitSelectHorse(this.index);
	}
}
