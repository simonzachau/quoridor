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
	WALLS_PER_PLAYER: 10,
	ALLOW_DIAGONAL_MOVEMENT: false
};

const DIRECTION = {
	UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8
};

const DIAGONAL_DIRECTION = {
	UP_RIGHT: DIRECTION.UP | DIRECTION.RIGHT,
	UP_LEFT:  DIRECTION.UP | DIRECTION.LEFT,
	DOWN_RIGHT: DIRECTION.DOWN | DIRECTION.RIGHT,
	DOWN_LEFT: DIRECTION.DOWN | DIRECTION.LEFT
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


function moveCurrentPlayer(state, position) {
	const possiblePositionKeys = getPossiblePositions(state).map(createPositionKey);

	if (possiblePositionKeys.indexOf(createPositionKey(position)) !== -1) {
		return Object.assign({}, state, {
			players: Object.assign({}, state.players, {
				[state.currPlayer]: Object.assign({}, state.players[state.currPlayer], { 
					position: position
				})
			})
		});
	} else {
		throw new NotAllowedMovementException();
	}

}


function getPossiblePositions(state) {
	let directions = Object.values(DIRECTION);
	if (SETTINGS.ALLOW_DIAGONAL_MOVEMENT) {
		directions = directions.concat(Object.values(DIAGONAL_DIRECTION));
	}
	return directions
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
	const isNotDiagonal = Object.values(DIRECTION).indexOf(direction) !== -1;
	const wallKey = createWallKey([position1, position2]);

	if (isNotDiagonal) {
		state.walls.forEach(wall => {
			if (wallKey === createWallKey(wall)) return true;
		});
		return false;
	} else {
	    const [baseDirection1, baseDirection2] = getBaseDirections(direction);  // should always be 2 directions

        // walls for base directions up and right:
        //      |
        //      0 pos2
        //      |
        // --3--+--1--
        //      |
        // pos1 2
        //      |
        const walls = [
            isWallBetween(state, resolveDirection(position1, baseDirection1), position2),
            isWallBetween(state, resolveDirection(position1, baseDirection2), position2),
            isWallBetween(state, position1, resolveDirection(position1, baseDirection2)),
            isWallBetween(state, position1, resolveDirection(position1, baseDirection1))
        ];
        return (walls[0] && walls[1]) || (walls[2] && walls[3]) || (walls[0] && walls[2]) || (walls[1] && walls[3]);
	}
}


function getBaseDirections(direction) {
    return Object.values(DIRECTION).filter(baseDirection => direction & baseDirection);
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

	let direction = 0;

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
	let [x, y] = pos;

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
	return wall.map(createPositionKey).sort().join('-');
}

function createPositionKey(position) {
	return position.join('-');
}

class NotAdjacentException extends Error {

}

class NotAllowedMovementException extends Error {

}

class NotAllowedWallException extends Error {

}

class WereLazyException extends Error {

}

