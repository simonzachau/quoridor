// {
// 	players: [
// 		{position: [1, 2], wallsRemaining: 3},
// 		{position: [1, 8], wallsRemaining: 2}
// 	],
//  currPlayer: 0,
//  winner: null,
// 	walls: [
// 		[[1,2], [3,4]],
// 		[[1,2], [3,4]],
// 		[[1,2], [3,4]],
// 		[[1,2], [3,4]],
// 		[[1,2], [3,4]],
// 		[[1,2], [3,4]],
// 	]
// }

const SETTINGS = {
	ROWS: 9,
	COLUMNS: 9,
	WALLS_PER_PLAYER: 10
	//...
};

const DIRECTION = {
	UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8
};



function createBaseState() {
	return  {
		players: [
			{position: [0, Math.floor(SETTINGS.COLUMNS/2)], wallsRemaining: SETTINGS.WALLS_PER_PLAYER},
			{position: [SETTINGS.ROWS - 1, Math.floor(SETTINGS.COLUMNS/2)], wallsRemaining: SETTINGS.WALLS_PER_PLAYER}
		],
		currPlayer: 0,
		winner: null,
		walls: []
	}
}

function setWallSegment(state, wall) {

	const [p1, p2] = wall;

	if (!arePositionsAdjacent(p1, p2) || !isPositionInBounds(p1) || !isPositionInBounds(p2)) {
		throw new NotAdjacentException();
	}

	const wallKeys = state.walls.map(createWallKey);
	if (wallKeys.contains(createWallKey(wall))) {
		throw new NotAllowedWallException();
	}

	return Object.assign({}, state, {
		walls: state.walls.concat([wall])
	});
}

function isWinnable(state) {
	state.players.forEach(player => {

	});
}

// TODO: 
// function isReachable(position, )


function moveCurrentPlayer(state, direction) {

	let hops = resolveMovement(state, direction);

	if (isMovementValid(state, hops)) {
		return Object.assign({}, state, {
			players: Object.assign({}, state.players, {
				[state.currPlayer]: Object.assign({}, state.players[state.currPlayer], { 
					position: path[path.length - 1]
				})
			})
		});
	} else {
		throw new NotAllowedMovementException();
	}

}


function getPossiblePositions(state, position) {

	// TODO: allow diagonal movement
	let previousPosition = position;
	return Object.values(DIRECTION)
		.map(direction => resolveMovement(state, direction))
		.filter(hops => isMovementValid(state, hops))
		.map(hops => hops[hops.length - 1]);
}


function isMovementValid(state, hops) {
	let wallBetween = false;
	for (let i = 0; i < hops.length - 1; i++) {
		wallBetween = wallBetween && isWallBetween(state, hops[i], hops[i + 1]);
	}
	return isPositionInBounds(hops[hops.length - 1]) && !wallBetween;
}


function isWallBetween(state, position1, position2) {

	if(!arePositionsAdjacent(position1, position2)) {
		throw new NotAdjacentException();
	}

	const direction = getDirection(position1, position2);
	const isNotDiagonal = Object.values(DIRECTION).reduce((isPrimitive, primitive) => isPrimitive && primitive === direction, true);
	const wallKey = createWallKey([position1, position2]);

	if (isNotDiagonal) {
		state.walls.forEach(wall => {
			if (wallKey === createWallKey(wall)) return true;
		});
		return false;
	} else {
		// TODO: improvement...
		throw new WereLazyException();
	}
}


function getDirection(position1, position2) {

	if (!arePositionsAdjacent(position1, position2)) {
		throw new NotAdjacentException();
	}

	const [x1, y1] = position1;
	const [x2, y2] = position2;

	if (x1 === x2 && y1 === y2) {
		throw new NotAdjacentException();
	}

	let direction = 0

	if (x2 > x1) {
		direction |= DIRECTION.RIGHT;
	}

	if (x2 < x1) {
		direction |= DIRECTION.LEFT;
	}

	if (y2 > y1) {
		direction |= DIRECTION.DOWN;
	}

	if (y2 < y1) {
		direction |= DIRECTION.UP;
	}
	return direction;
}

function arePositionsAdjacent(position1, position2) {
	const [x1, y1] = position1;
	const [x2, y2] = position2;
	return isInRange(x1 - x2, -1, 2) && isInRange(y1 - y2, -1, 2);
}

function isPositionInBounds(position) {
	const [x, y] = position;
	return isInRange(x, 0, SETTINGS.COLUMNS) && isInRange(y, 0, SETTINGS.ROWS);
}

function isInRange(val, lower, upper) {
	return val >= lower && val < upper;
}


function isPositionEmpty(state, position) {

	const [x, y] = position;
	return state.players.reduce((isEmpty, player) => {
		const [px, py] = player.position;
		return isEmpty && (x !== px || y !== py);
	}, true);
}


function resolveMovement(state, direction) {

	const currentPosition = state.players[state.currPlayer].position;
	let newPosition = resolveDirection(currentPosition, direction);
	const hops = [currentPosition, newPosition];
	while (!isPositionEmpty(state, newPosition)) {
		newPosition = resolveDirection(newPosition, direction);
		hops.push(newPosition);
	}
	return hops;
}


function resolveDirection(pos, direction) {
	const [x, y] = pos;

	if (direction & DIRECTION.UP) {
		y--;
	}

	if (direction & DIRECTION.DOWN) {
		y++;
	}

	if (direction & DIRECTION.LEFT) {
		x--;
	}

	if (direction & DIRECTION.RIGHT) {
		x++;
	}

	return [x, y];
}

function getNextPlayer(state) {
	return (state.currPlayer + 1) % state.players.length;
}

function createWallKey(wall) {
	return wall.map(position => position.join('-')).sort().join('-');
}

class NotAdjacentException extends Error {

}

class NotAllowedMovementException extends Error {

}

class NotAllowedWallException extends Error {

}

class WereLazyException extends Error {

}

