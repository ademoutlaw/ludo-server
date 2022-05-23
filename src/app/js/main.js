import Game from './game/index.js';
import { COLORS } from './game/config.js';

const $home = document.getElementById('home');
const $home2 = document.getElementById('home2');
const $startBtn = document.getElementById('start');
const $name = document.getElementById('name');
const $color = document.getElementById('color');
const $roomId = document.getElementById('roomId');
const $players = document.getElementById('players');

const socket = io();

const availableColors = [true, true, true, true];

function renderColors() {
	$color.innerHTML = '';
	let value = null;
	for (const [index, toAdd] of availableColors.entries()) {
		if (!toAdd) continue;
		const opt = document.createElement('option');
		opt.value = index;
		if (value == null) {
			value = index;
		}
		opt.text = COLORS[index];
		opt.className = COLORS[index];
		$color.appendChild(opt);
	}
	$color.value = value;
}
renderColors();

$startBtn.disabled = true;
$name.addEventListener('change', () => {
	$startBtn.disabled = $name.value.length < 3;
	$name.className = $name.value.length < 3 ? 'error' : '';
});
$startBtn.addEventListener('click', () => {
	join($color.value + $name.value);
});
socket.on('changeColor', () => {
	availableColors[$color.value] = false;
	$home.className = '';
	renderColors();
});
socket.on('wait', game => {
	$home.className = 'hide';
	$home2.className = '';
	console.log('wait', game);
	$roomId.innerText = game.id;
	$players.innerHTML = '';
	for (let index = 0; index < 4; index++) {
		const $player = document.createElement('div');
		$players.appendChild($player);
		const player = game.players[index];
		if (player) {
			$player.className = 'player ' + COLORS[player.color];
			$player.innerText = player.name;
			if ($name.value == player.name) {
				$player.classList.add('me');
			}
		} else {
			$player.className = 'player';
			$player.innerText = '...';
		}
	}
});

function join(player) {
	console.error(player);
	if (!player) return;
	$home.className = 'load';
	socket.emit('join', { color: player.charAt(0), name: player.substring(1) });
	sessionStorage.setItem('player', player);
}
join(sessionStorage.getItem('player'));

window.game = new Game(socket);
