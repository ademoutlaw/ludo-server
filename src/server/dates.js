const MAX_DELAY = 2000;
const MIN_DELAY = 1000;
const DANGER_DELAY = 2000;
const JUM_DELAY = 800;
const BACKWARD_DELAY = 300;
const ROLL_DICE_DELAY = 4000;

const COMPUTE_FUNCTIONS = {
	rollDice(event, players) {
		return ROLL_DICE_DELAY;
	},
	setAllowed(event, players) {
		return MIN_DELAY;
	},
	moveHorse(event, players) {
		if (event.direction == 'forward') {
			return event.path.length * JUM_DELAY;
		}
		return players[event.turn].headway * BACKWARD_DELAY;
	},
	setTurn(event, players) {
		return MIN_DELAY;
	},
	init() {
		return MIN_DELAY;
	},
};

module.exports = {
	computeEventDates(now, events, players) {
		let notBefore = now;
		let toSetTurn = false;
		for (const event of events) {
			notBefore += COMPUTE_FUNCTIONS[event.name](event, players);
			toSetTurn = toSetTurn || event.name == 'setTurn' || event.name == 'init';
		}
		if (toSetTurn) {
			return {
				notBefore,
				inDangerAt: notBefore + MAX_DELAY - DANGER_DELAY,
				autoPlayAt: notBefore + MAX_DELAY,
			};
		}
		return { notBefore };
	},
};
