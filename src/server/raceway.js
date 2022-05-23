const PATH = [
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 7 },
	{ type: 'arrow', next: 8, nextForSC: 22, color: 2 },
	{ type: 'empty', next: 23 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 6 },
	{ type: 'solid', next: 37 },
	{ type: 'solid', next: 38 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'star', next: 21 },
	{ type: 'solid', next: 52 },
	{ type: 'empty', next: 53 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 36 },
	{ type: 'solid', next: 67 },
	{ type: 'empty', next: 68 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 51 },
	{ type: 'solid', next: 82 },
	{ type: 'empty', next: 83 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 66 },
	{ type: 'solid', next: 82 },
	{ type: 'empty', next: 99 },
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 91 },
	{ type: 'solid', next: 92 },
	{ type: 'empty', next: 93 },
	{ type: 'empty', next: 94 },
	{ type: 'empty', next: 95 },
	{ type: 'empty', next: 81 },
	null,
	null,
	null,
	{ type: 'empty', next: 100 },
	{ type: 'empty', next: 101 },
	{ type: 'empty', next: 102 },
	{ type: 'star', next: 103 },
	{ type: 'empty', next: 104 },
	{ type: 'empty', next: 119 },
	{ type: 'arrow', next: 90, nextForSC: 106, color: 1 },
	{ type: 'solid', next: 107 },
	{ type: 'solid', next: 108 },
	{ type: 'solid', next: 109 },
	{ type: 'solid', next: 110 },
	{ type: 'solid', next: 110 },
	null,
	null,
	null,
	{ type: 'solid', next: 114 },
	{ type: 'solid', next: 114 },
	{ type: 'solid', next: 115 },
	{ type: 'solid', next: 116 },
	{ type: 'solid', next: 117 },
	{ type: 'arrow', next: 134, nextForSC: 118, color: 3 },
	{ type: 'empty', next: 105 },
	{ type: 'empty', next: 120 },
	{ type: 'star', next: 121 },
	{ type: 'empty', next: 122 },
	{ type: 'empty', next: 123 },
	{ type: 'empty', next: 124 },
	null,
	null,
	null,
	{ type: 'empty', next: 143 },
	{ type: 'empty', next: 129 },
	{ type: 'empty', next: 130 },
	{ type: 'empty', next: 131 },
	{ type: 'solid', next: 132, color: '2' },
	{ type: 'empty', next: 133 },
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 125 },
	{ type: 'solid', next: 127, color: '3' },
	{ type: 'empty', next: 158 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 141 },
	{ type: 'solid', next: 142, color: '3' },
	{ type: 'empty', next: 173 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 156 },
	{ type: 'solid', next: 157, color: '3' },
	{ type: 'empty', next: 188 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 171 },
	{ type: 'solid', next: 172, color: '3' },
	{ type: 'star', next: 203 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'solid', next: 186, color: '3' },
	{ type: 'solid', next: 187, color: '3' },
	{ type: 'empty', next: 218 },
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	null,
	{ type: 'empty', next: 201 },
	{ type: 'arrow', next: 216, nextForSC: 202, color: 0 },
	{ type: 'empty', next: 217 },
	null,
	null,
	null,
	null,
	null,
	null,
];
const DOORS = [201, 91, 23, 133];

function isSafeCell(index) {
	return ['solid', 'star'].includes(PATH[index]?.type);
}
function randomItem(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function getPath(index, dice, playerIndex) {
	const path = [];
	for (let i = 0; i < dice; i++) {
		const current = PATH[index];
		if (!current) {
			return null;
		}
		const nextKey = current.type == 'arrow' && current.color == playerIndex ? 'nextForSC' : 'next';
		index = current[nextKey];
		path.push(index);
	}
	return path;
}

module.exports = {
	moveHorse({ horseIndex, playerIndex, players, dice }) {
		let index = players[playerIndex].horses[horseIndex];
		if (index == -1) {
			return { path: [DOORS[playerIndex]] };
		} else {
			const path = getPath(index, dice, playerIndex);
			index = path[path.length - 1];
			if (!isSafeCell(index)) {
				for (let i = 0; i < 4; i++) {
					if (i == playerIndex) continue;
					for (let j = 0; j < 4; j++) {
						if (index == players[i].horses[j]) {
							return { path, deadHorse: { player: i, index: j } };
						}
					}
				}
			}

			return { path };
		}
	},
	rollDice(horses) {
		const moves = [true, true, true, true, true, true];
		for (const horse of horses) {
			if (horse == -1) continue;
			for (let i = 0; i < 6; i++) {
				if (!moves[i]) continue;
				const path = getPath(horse, i + 1, -1);
				if (!path) continue;
				const index = path[path.length - 1];
				moves[i] = isSafeCell(index) || !horses.includes(index);
			}
		}
		const allowed = moves.map((m, i) => (m ? i : -1)).filter(m => m >= 0);
		return randomItem(allowed) + 1;
	},
	getAllowedHorses(horses, dice) {
		const allowed = [];
		for (const [i, index] of horses.entries()) {
			if ((index == -1 && dice == 6) || (index > 0 && (!isSafeCell(index) || getPath(index, dice, -1)))) {
				allowed.push(i);
			}
		}
		return allowed;
	},
};
