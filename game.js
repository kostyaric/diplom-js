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

class Level {

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

	actorAt(actor) {

		if (!(actor instanceof Actor)) {
			throw new Error('В качестве параметра можно передавать только объект с типом Actor');
		}

		for(let currentActor of this.actors) {
			if (actor.isIntersect(currentActor)) {
				return currentActor;
			}
		}

		return undefined;

	}

	obstacleAt(pos, size) {

		if (!((pos instanceof Vector) && (size instanceof Vector))) {
			throw new Error('И позиция и размер должны иметь тип Vector');
		}

		let virtualActor = new Actor(pos, size);

		if (virtualActor.bottom > this.height) {
			return 'lava';
		}
		else if (virtualActor.left < 0 || virtualActor.right > this.width || virtualActor.top < 0) {
			return 'wall';
		}
		
		for (let i = Math.round(virtualActor.top); i < Math.round(virtualActor.bottom); i++) {

			for (let j = Math.round(virtualActor.left); j < Math.round(virtualActor.right); j++) {
			
				console.log(this.grid[i][j]);
				if (this.grid[i][j] !== undefined) {
					return this.grid[i][j];
				}

			}

		}

		return undefined;

	}

	removeActor(actor) {

		let index = this.actors.indexOf(actor);
		if (index !== -1) {
			this.actors.splice(index, 1);
		}

	}

	noMoreActors(objectType) {

		return !this.actors.some(elem => elem.type === objectType);

	}

	playerTouched(objectType, actor = undefined) {

		if (this.status === null) {
			
			if (objectType === 'lava' || objectType === 'fireball') {
				this.status = 'lost';
			}

			if (objectType === 'coin') {
				
				this.removeActor(actor);

				if (this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}

		}

	}

}

class LevelParser {

	constructor(dictionary) {
		this.dictionary = dictionary;
	}

	actorFromSymbol(symbol) {

		if (symbol === undefined || !(symbol in this.dictionary)) {
			return undefined;
		}

		return this.dictionary[symbol];

	}

	obstacleFromSymbol(symbol) {

		if (symbol === 'x') {
			return 'wall';
		}
		else if (symbol === '!') {
			return 'lava';
		}

		return undefined;

	}

	createGrid (plan) {

		const grid = [];

		for (let i = 0; i < plan.length; i++) {
			
			let symbolArray = plan[i].split('');
			grid.push(symbolArray.map(this.obstacleFromSymbol));

		}

		return grid;

	}

	createActors(plan) {

		if (this.dictionary === undefined) {
			return [];
		}

		let actors = [];
		let symbolArray;
		let actorClass;
		let actor;

		for (let i = 0; i < plan.length; i++) {
			
			symbolArray = plan[i].split('');
			
			for (let j = 0; j < symbolArray.length; j++) {
				
				actorClass = this.actorFromSymbol(symbolArray[j]);
				if (actorClass === undefined || typeof actorClass !== 'function') {
					continue;
				}

				actor = new actorClass(new Vector(j, i));
				if (!(actor instanceof Actor)) {
					continue;
				}
				
				actors.push(actor);
			}

		}

		return actors;

	}

	parse(plan) {
		return new Level(this.createGrid(plan), this.createActors(plan));
	}

}

class Fireball extends Actor {

	getNextPosition() {

	}

	handleObstacle() {

	}

	act() {

	}

}

class HorizontalFireball extends Fireball {

}

class VerticalFireball extends Fireball {
	
}

class FireRain extends VerticalFireball {

}

class Coin extends Actor {
	
}

class Player extends Actor {


}


/*тест*/
/*
const grid = [
    new Array(3),
    ['wall', 'wall', 'lava'],
    new Array(3)
  ];
  const level = new Level(grid);
  runLevel(level, DOMDisplay);
*/