const FPS = 60;
const SECONDS_PER_TICK = 1 / FPS;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

class SpaceGame {
  constructor() {
    this.onNewEnemyBullet = this.onNewEnemyBullet.bind(this);
    this.onGameOver = this.onGameOver.bind(this);

    this.startTime = null;
    this.gameEnded = false;
    this.canvas = document.getElementById('screen');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');

    this.playerShip = new PlayerShip();
    this.enemyFleet = new EnemyFleet(this.onNewEnemyBullet, this.onGameOver);
    this.enemyBullets = [];
  }

  start() {
    // Initialize objects.
    this.playerShip.start();
    this.enemyFleet.start();

    // Begin loop.
    this.startGameLoop();
  }

  startGameLoop() {
    this.startTime = performance.now();

    let ticksLastTime = 0;
    const gameLoop = (timestamp) => {
      this.clearScreen();
      const secondsSinceStart = (timestamp - this.startTime) / 1000;
      const ticksSinceStart = Math.floor(secondsSinceStart / SECONDS_PER_TICK);
      const ticksDelta = ticksSinceStart - ticksLastTime;

      this.playerShip.update(ticksDelta);
      this.playerShip.render(this.ctx);

      this.enemyFleet.update(ticksDelta);
      this.enemyFleet.render(this.ctx);

      // Update bullet positions.
      this.enemyBullets.forEach(bullet => bullet.update(ticksDelta));
      this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isAlive());
      this.enemyBullets.forEach(bullet => bullet.render(this.ctx));

      // Resolve enemy bullet collisions.
      this.playerShip.resolveCollisions(this.enemyBullets);
      this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isAlive());

      ticksLastTime = ticksSinceStart;
      if (!this.gameEnded) {
        requestAnimationFrame(gameLoop);
      } else {
        this.clearScreen();
      }
    };

    // Begin animation loop.
    requestAnimationFrame(gameLoop);
  };

  // Private methods
  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  onNewEnemyBullet(bullet) {
    this.enemyBullets.push(bullet);
  }

  onGameOver() {
    this.gameEnded = true;
  }
}

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  detectCollision(other) {
    const myLeftX = this.x;
    const myRightX = this.x + this.width;
    const myTopY = this.y;
    const myBottomY = this.y + this.height;

    const otherLeftX = other.x;
    const otherRightX = other.x + other.width;
    const otherTopY = other.y;
    const otherBottomY = other.y + other.height;

    // Miss left: |-----|  *****
    // If my box starts after their box ends:
    if (myLeftX > otherRightX) {
      return false;
    }

    // Miss right: *****  |----|
    // If their box starts after my box ends:
    if (otherLeftX > myRightX) {
      return false;
    }

    // If my box starts below their box:
    if (myTopY > otherBottomY) {
      return false;
    }

    // If their box starts below my box:
    if (otherTopY > myBottomY) {
      return false;
    }

    // Otherwise, there must be a collision
    return true;
  }
}

const PLAYER_SHIP_HEIGHT = 20;
const PLAYER_SHIP_WIDTH = 50;
const PLAYER_SHIP_UPDATE_PIXELS_PER_TICK = 7;
const PLAYER_SHIP_RIGHT_BOUND = CANVAS_WIDTH - PLAYER_SHIP_WIDTH;
const PLAYER_SHIP_LEFT_BOUND = 0;

class PlayerShip extends Rectangle {
  constructor() {
    const startX = (CANVAS_WIDTH - PLAYER_SHIP_WIDTH) / 2;
    const startY = CANVAS_HEIGHT - PLAYER_SHIP_HEIGHT * 1.5;
    super(startX, startY, PLAYER_SHIP_WIDTH, PLAYER_SHIP_HEIGHT)

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  start() {
    this.restart();
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('keydown', this.onKeyDown);
  }

  restart() {
    this.health = 3;
    this.xVelocity = 0;
    this.arrowsPressed = [];
  }

  update(dt) {
    const newX = Math.max(
      Math.min(this.x + this.xVelocity, PLAYER_SHIP_RIGHT_BOUND), PLAYER_SHIP_LEFT_BOUND);
    this.x = newX;
  }

  resolveCollisions(enemyBullets) {
    if (enemyBullets.length === 0) {
      return;
    }
    enemyBullets.forEach(bullet => {
      if (this.detectCollision(bullet)) {
        this.health--;
        bullet.kill();
      }
    });
  }

  render(ctx) {
    if (this.health === 3) {
      ctx.fillStyle = 'hotpink';
    } else if (this.health === 2) {
      ctx.fillStyle = 'yellow';
    } else {
      ctx.fillStyle = 'red';
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  // Private
  onKeyDown(event) {
    const key = event.key;
    if (key === 'ArrowLeft') {
      this.xVelocity = -PLAYER_SHIP_UPDATE_PIXELS_PER_TICK;
      this.arrowsPressed.push(key);
    } else if (key === 'ArrowRight') {
      this.xVelocity = PLAYER_SHIP_UPDATE_PIXELS_PER_TICK;
      this.arrowsPressed.push(key);
    }
  }
  onKeyUp(event) {
    const key = event.key;
    this.arrowsPressed = this.arrowsPressed.filter(element => element !== key);
    if (this.arrowsPressed.length === 0) {
      this.xVelocity = 0;
    }
  }
}

const ENEMY_BOX_HEIGHT = 20;
const ENEMY_BOX_WIDTH = 30;
const ENEMY_COL_MARGIN = 7;
const ENEMY_ROW_MARGIN = 18;
const UPDATE_FREQUENCY_START = 10;

class EnemyFleet {
  constructor(onNewBullet, onGameOver) {
    this.onNewBullet = onNewBullet;
    this.onGameOver = onGameOver;

    this.onBumpedEdge = this.onBumpedEdge.bind(this);
    this.onReachedEnd = this.onReachedEnd.bind(this);
  }

  start() {
    this.restart();
  }

  restart() {
    this.enemies = [];
    this.enemiesByColRow = [];
    this.ticksSoFar = 0;
    this.updateFrequency = UPDATE_FREQUENCY_START;
    this.needsNextRow = false;

    for (let col = 0; col < 11; col++) {
      const startX = ENEMY_COL_MARGIN + (ENEMY_BOX_WIDTH + ENEMY_COL_MARGIN) * col;
      this.enemiesByColRow[col] = [];
      for (let row = 0; row < 5; row++) {
        const startY = ENEMY_ROW_MARGIN + (ENEMY_BOX_HEIGHT + ENEMY_ROW_MARGIN) * row;
        const enemy = new Enemy(startX, startY, this.onBumpedEdge, this.onReachedEnd);
        this.enemies.push(enemy);
        this.enemiesByColRow[col].push(enemy);
      }
    }
  }

  update(dt) {
    this.ticksSoFar += dt;

    // Choose a random shooter.
    if (this.ticksSoFar % (this.updateFrequency * 3) == 0) {
      // Kill off shooters for testing
      // const shooterOne = this.chooseRandomShooter();
      // if (this.enemies.length > 3) {
      //   shooterOne.kill();
      // }
      const shooter = this.chooseRandomShooter();
      const bullet = shooter.createBullet();
      this.onNewBullet(bullet);
      shooter.highlight();
    }

    if (this.ticksSoFar % this.updateFrequency == 0) {
      if (this.needsNextRow) {
        this.enemies.forEach(enemy => enemy.advanceY());
        this.needsNextRow = false;
      } else {
        this.enemies.forEach(enemy => enemy.advanceX(dt));
      }
    }
    // this.enemies = this.enemies.filter( enemy => enemy.isAlive() );
  }

  render(ctx) {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }

  // Private methods
  onBumpedEdge() {
    this.needsNextRow = true;
  }

  onReachedEnd() {
    this.onGameOver();
  }

  chooseRandomShooter() {
    const potentialShooters = [];
    for (const row of this.enemiesByColRow) {
      for (let i = row.length - 1; i >= 0; i--) {
        const enemy = row[i];
        if (enemy.isAlive()) {
          potentialShooters.push(enemy);
          break;
        }
      }
    }
    const index = Math.floor(Math.random() * (potentialShooters.length));
    if (index !== -1) {
      return potentialShooters[index];
    } else {
      return null;
    }
  }
}

const ENEMY_X_MOVE_WIDTH = 5;
const TICKS_HIGHLIGHTED = 1;

class Enemy extends Rectangle {
  constructor(startX, startY, onBumpedEdge, onReachedEnd) {
    super(startX, startY, ENEMY_BOX_WIDTH, ENEMY_BOX_HEIGHT);
    this.onBumpedEdge = onBumpedEdge;
    this.onReachedEnd = onReachedEnd;
    this.color = 'white';

    this.xVelocity = ENEMY_X_MOVE_WIDTH;
    this.shouldHighlight = false;
    this.highlightTicks = 0;

    this.alive = true;
  }

  advanceY() {
    console.assert(this.alive);

    // Reverse direction.
    this.xVelocity *= -1;

    // Attempt to advance the row.
    const newY = this.y + ENEMY_ROW_MARGIN;
    const bound = CANVAS_HEIGHT - ENEMY_BOX_HEIGHT * 4;
    if (newY >= bound) {
      this.onReachedEnd();
    } else {
      this.y = newY;
    }
  }

  advanceX(dt) {
    console.assert(this.alive);

    const leftBound = ENEMY_COL_MARGIN;
    const rightBound = CANVAS_WIDTH - this.height - ENEMY_COL_MARGIN;

    const newX = this.x + this.xVelocity;
    const nextX = this.x + 2 * this.xVelocity;

    // Notify fleet if we've bumped into the edge.
    if (nextX > rightBound || nextX < leftBound) {
      this.onBumpedEdge();
    }
    console.assert(newX >= leftBound);
    console.assert(newX <= rightBound);
    this.x = newX;

    // Update color if we're supposed to be highlighted.
    if (this.shouldHighlight) {
      if (this.highlightTicks >= TICKS_HIGHLIGHTED) {
        this.highlightTicks = 0;
        this.shouldHighlight = false;
        this.color = 'white';
      } else {
        if (this.highlightTicks === 0) {
          this.color = 'red';
        }
        this.highlightTicks += dt;
      }
    }
  }

  render(ctx) {
    console.assert(this.alive);

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  highlight() {
    console.assert(this.alive);
    this.shouldHighlight = true;
  }

  kill() {
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }

  createBullet() {
    const bulletX = this.x + this.width / 2;
    const bulletY = this.y + this.height / 2;
    return new Bullet(bulletX, bulletY);
  }
}

const BULLET_Y_VELOCITY = 5;
const BULLET_SIZE = 3;

class Bullet extends Rectangle {
  constructor(startX, startY) {
    super(startX, startY, BULLET_SIZE, BULLET_SIZE);
    this.color = 'white';

    this.yVelocity = BULLET_Y_VELOCITY;
    this.alive = true;
  }

  update(dt) {
    console.assert(this.alive);
    const yBound = CANVAS_HEIGHT - BULLET_SIZE;
    const newY = this.y + this.yVelocity;

    if (newY > yBound) {
      this.kill();
    }
    this.y = newY;
  }

  render(ctx) {
    console.assert(this.alive);

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  kill() {
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }
}

////////////////////////////////

const game = new SpaceGame();
game.start();
