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
		
		for (let i = Math.floor(virtualActor.top); i < Math.ceil(virtualActor.bottom); i++) {

			for (let j = Math.floor(virtualActor.left); j < Math.ceil(virtualActor.right); j++) {
			
				if (this.grid[i][j] !== undefined) {
					return this.grid[i][j];
				}

			}

		}

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

	constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
		super(pos, new Vector(1, 1), speed);
	}

	get type() {
		return 'fireball';
	}

	getNextPosition(time = 1) {
		return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
	}

	handleObstacle() {
		this.speed.x *= -1;
		this.speed.y *= -1;
	}

	act(time, level) {

		let nextPos = this.getNextPosition(time);

		if (level.obstacleAt(nextPos, this.size) === undefined) {
			this.pos = nextPos;
		}
		else {
			this.handleObstacle();
		}

	}

}

class HorizontalFireball extends Fireball {

	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(2, 0));
	}

}

class VerticalFireball extends Fireball {
	
	constructor(pos = new Vector(0, 0)) {
		super(pos, new Vector(0, 2));
	}

}

class FireRain extends Fireball {

	constructor(pos) {
		super(pos, new Vector(0, 3));
		this.initalPos = pos;
	}

	handleObstacle() {
		this.pos = this.initalPos;
	}

}

class Coin extends Actor {

	constructor(pos = new Vector(0, 0)) {

		super(pos, new Vector(0.6, 0.6), new Vector(0,0));

		this.startPos = pos;
		this.pos = this.pos.plus(new Vector(0.2, 0.1));
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * 2 * Math.PI;

	}

	get type() {
		return 'coin';
	}

	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}

	getSpringVector() {
		return new Vector(0, Math.sin(this.spring) * this.springDist);
	}

	getNextPosition(time = 1) {

		this.updateSpring(time);

		// console.log(this.startPos);
		let springVector = this.getSpringVector();
		// let newVector = this.startPos.plus(springVector);
		// console.log(newVector);

		this.startPos = this.startPos.plus(springVector);
		// return this.startPos;
		// return newVector.times(time);

		return new Vector(this.pos.x, this.pos.y + springVector.y);
		// const springVector = this.getSpringVector();


	}

	act(time){
		this.pos = this.getNextPosition(time);
	}	

}


class Player extends Actor{
	
	constructor(pos = new Vector(1, 1)){
		super(new Vector(pos.x, pos.y - 0.5), new Vector(0.8, 1.5));	
	}
	
	get type(){
		return 'player';
	}
}

const schemas = 
[
  [
    "     v                 ",
    "                       ",
    "                       ",

    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",

    "                       ",
    "                       ",
    "  |xxx       w         ",
    "  o                 o  ",
    "  x               = x  ",
    "  x          o o    x  ",
    "  x  @    *  xxxxx  x  ",
    "  xxxxx             x  ",
    "      x!!!!!!!!!!!!!x  ",
    "      xxxxxxxxxxxxxxx  ",
    "                       "
  ],
  [
    "     v                 ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "  |                    ",
    "  o                 o  ",
    "  x               = x  ",
    "  x          o o    x  ",
    "  x  @       xxxxx  x  ",
    "  xxxxx             x  ",
    "      x!!!!!!!!!!!!!x  ",
    "      xxxxxxxxxxxxxxx  ",
    "                       "
  ],
  [
    "        |           |  ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "                       ",
    "     |                 ",
    "                       ",
    "         =      |      ",
    " @ |  o            o   ",
    "xxxxxxxxx!!!!!!!xxxxxxx",
    "                       "
  ],
  [
    "                       ",
    "                       ",
    "                       ",
    "    o                  ",
    "    x      | x!!x=     ",
    "         x             ",
    "                      x",
    "                       ",
    "                       ",
    "                       ",
    "               xxx     ",
    "                       ",
    "                       ",
    "       xxx  |          ",
    "                       ",
    " @                     ",
    "xxx                    ",
    "                       "
  ], [
    "   v         v",
    "              ",
    "         !o!  ",
    "              ",
    "              ",
    "              ",
    "              ",
    "         xxx  ",
    "          o   ",
    "        =     ",
    "  @           ",
    "  xxxx        ",
    "  |           ",
    "      xxx    x",
    "              ",
    "          !   ",
    "              ",
    "              ",
    " o       x    ",
    " x      x     ",
    "       x      ",
    "      x       ",
    "   xx         ",
    "              "
  ]
];

const actorDict = {
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
}

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));

