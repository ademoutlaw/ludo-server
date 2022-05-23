export default class Timer {
	constructor(game) {
		this.game = game;
		this.$timers = [];
	}
	start() {
		for (let i = 0; i < 4; i++) {
			const stable = this.game.stables[i];
			const $timer = document.createElement('div');
			$timer.className = 'timer';
			stable.$stable.appendChild($timer);
			this.$timers.push($timer);
		}
		requestAnimationFrame(this.loop.bind(this));
	}
	loop() {
		this.game.update();
		requestAnimationFrame(this.loop.bind(this));
	}
	show() {}
	alert() {}
}
