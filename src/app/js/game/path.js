export default class PathCell {
	constructor({ type, index, color, nextSameColor, nextOtherColor, $cell }) {
		this.index = index;
		this.type = type;
		this.color = color;
		this.nextSameColorIdx = nextSameColor;
		this.nextOtherColorIdx = nextOtherColor;
		this.nextSameColor = null;
		this.nextOtherColor = null;
		this.$cell = $cell;
	}
	attachToPath(path) {
		this.nextSameColor = path[this.nextSameColorIdx];
		this.nextOtherColor = path[this.nextOtherColorIdx];
	}
	next(playerColor) {
		return this.type == 'arrow' && playerColor !== this.color ? this.nextOtherColor : this.nextSameColor;
	}
}
