'use strict';

class Vector {

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(addedVector) {
		
		if (!(addedVector instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector');
		}

		return new Vector(this.x + addedVector.x, this.y + addedVector.y);

	}

	times(multiplier) {
		
		return new Vector(this.x * multiplier, this.y * multiplier);

	}
}

class Actor {

	constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {

		if (!((pos instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector))) {
			throw new Error('В параметрах можно передавать только вектор типа Vector');
		}

		this.pos = pos;
		this.size = size;
		this.speed = speed;

	}

	get left() {
		return this.pos.x;
	}

	get top() {
		return this.pos.y;
	}

	get right() {
		return this.pos.x + this.size.x;
	}
	get bottom() {
		return this.pos.y + this.size.y;
	}

	get type() {
		return 'actor';
	}

	act() {}

	isIntersect(anotherActor) {

		if (!(anotherActor instanceof Actor)) {
			throw new Error('Делать проверку на пересечение можно только с объектом типа Actor');
		}

		if (anotherActor === this) {
			return false;
		}

		return this.left < anotherActor.right && this.right > anotherActor.left
			&& this.top < anotherActor.bottom && this.bottom > anotherActor.top;

	}

}

class Level
{

	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.player = actors.filter(elem => elem.type === 'player')[0];
		this.height = grid.length;
		this.width = Math.max(0, ...grid.map(elem => elem.length));
		this.status = null;
		this.finishDelay = 1;
	}

	isFinished() {
		return this.status !== null && this.finishDelay < 0;
	}
}

/*
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
*/

/*
const Player = new Actor();

const grid = [
    new Array(3),
    ['wall', 'wall', 'lava']
  ];
  const level = new Level(grid);
  debugger;
  runLevel(level, DOMDisplay);
*/