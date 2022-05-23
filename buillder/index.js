const $cells = document.getElementById('cells');
const $color = document.getElementById('color');
const $object = document.getElementById('object');
const $direction = document.getElementById('direction');
const $output = document.getElementById('output');

const COLORS = ['red', 'green', 'yellow', 'blue'];

const cells = [];
const FUNCTIONS = {
	home(index) {
		const row = Math.floor(index / 15);
		const col = index - row * 15;
		setHome(row, col);
		return 'hide';
	},
	target(index) {
		const row = Math.floor(index / 15);
		const col = index - row * 15;
		setTarget(row, col);
		return 'hide';
	},
	solid(index) {
		cells[index].type = 'solid';
		cells[index].max = 6;
		cells[index].next = index;
		cells[index].color = $color.value;
		delete cells[index].nextForSC;
		return 'solid ' + COLORS[$color.value];
	},
	empty(index) {
		cells[index].type = 'empty';
		cells[index].next = index;
		delete cells[index].color;
		delete cells[index].max;
		delete cells[index].nextForSC;
		return '';
	},
	star(index) {
		cells[index].type = 'star';
		cells[index].next = index;
		delete cells[index].color;
		delete cells[index].max;
		delete cells[index].nextForSC;
		return 'star';
	},
	arrow(index) {
		cells[index].type = 'arrow';
		cells[index].next = index;
		cells[index].nextForSC = index;
		cells[index].color = $color.value;
		cells[index].dir = $direction.value;
		delete cells[index].max;
		return 'arrow ' + COLORS[$color.value] + ' ' + $direction.value;
	},
};
let toSetNext = 0;
init();

window.cells = cells;
function setHomes() {
	for (const [i, j] of [
		[0, 0],
		[9, 0],
		[0, 9],
		[9, 9],
	]) {
		setHome(j, i);
	}
}
function setHome(row, col) {
	setCells(row, col, 6);
}
function setTarget(row, col) {
	setCells(row, col, 3);
}
function setCells(row, col, length) {
	for (let r = 0; r < length; r++) {
		for (let c = 0; c < length; c++) {
			const index = (r + row) * 15 + c + col;
			const $cell = cells[index].$cell;
			$cell.className = 'hide';
			cells[index] = { type: 'hide', $cell };
		}
	}
	update();
}
function update() {
	$output.value = JSON.stringify(cells.map(({ type, $cell, ...cell }) => ('hide' == type ? null : { type, ...cell })));
	localStorage.setItem('cells', $output.value);
}
function setNext(index) {
	console.log('start');
	const currentCell = getFirstCellNotSet();
	currentCell.$cell.classList.remove('lint');
	if (toSetNext == 1) {
		currentCell.next = index;
	} else {
		currentCell.nextForSC = index;
	}
	do {
		console.log('search for next');
		const nextCell = getFirstCellNotSet();
		if (nextCell) {
			nextCell.$cell.classList.add('lint');
			break;
		}
		console.log('we had not next', nextCell);
		toSetNext++;
	} while (toSetNext <= 2);
	console.log('end');
}
function getFirstCellNotSet() {
	console.log('in');
	for (const cell of cells) {
		console.log(cell.type, toSetNext, cell.next, 'hide' !== cell.type && toSetNext == 1 && cell.next == -1);
		if ('hide' !== cell.type && toSetNext == 1 && cell.next == -1) return cell;
		if (toSetNext == 2 && cell.type == 'arrow' && cell.nextForSC == -1) return cell;
	}
}

document.getElementById('setNext').addEventListener('click', function () {
	toSetNext = 1;
	for (const cell of cells) {
		cell.$cell.classList.remove('lint');
		if (typeof cell.next != 'undefined') cell.next = -1;
		if (typeof cell.nextForSC != 'undefined') cell.nextForSC = -1;
	}
	update();
	console.log('done');
	const currentCell = getFirstCellNotSet();
	currentCell.$cell.classList.add('lint');
});

function init() {
	const sCells = JSON.parse(localStorage.getItem('cells') || '[]');
	cells.length = 0;
	for (let index = 0; index < 15 * 15; index++) {
		const $cell = document.createElement('span');
		$cell.addEventListener('click', function () {
			if (toSetNext) {
				setNext(index);
			} else {
				$cell.className = FUNCTIONS[$object.value](index);
			}
			update();
		});
		const cell = { $cell };
		if (sCells[index]) {
			const sCell = sCells[index];
			cell.type = sCell.type || 'empty';
			$cell.className = cell.type;
			cell.next = sCell.next || -1;

			if (sCell.type == 'arrow') {
				cell.nextForSC = sCell.nextForSC;
				cell.color = sCell.color;
				cell.dir = sCell.dir;
				$cell.classList.add(COLORS[sCell.color]);
				$cell.classList.add(sCell.dir);
			}
			if (sCell.type == 'solid') {
				$cell.classList.add(COLORS[sCell.color]);
				cell.color = sCell.color;
			}
		} else if (sCells[index] === null) {
			cell.type = 'hide';
			$cell.className = 'hide';
		}
		cells.push(cell);
		$cells.appendChild($cell);
	}
	update();
	setHomes();
	setTarget(6, 6);
}
