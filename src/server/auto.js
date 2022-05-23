function getAllowedHorses(horses, dice) {
	return [0, 1, 2, 3].filter(index => {
		const horse = horses[index];
		if (horse == -1) {
			return dice == 6;
		}
		return true;
	});
}
module.exports = {
	getRandomHorse(horses, dice) {
		const available = getAllowedHorses(horses, dice);
		return available[Math.floor(Math.random() * available.length)];
	},
};
