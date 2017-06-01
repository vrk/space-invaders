const FPS = 60;
const SECONDS_PER_TICK = 1 / FPS;
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

class SpaceGame {
  constructor() {
    this.onGameOver = this.onGameOver.bind(this);

    this.startTime = null;
    this.gameEnded = false;
    this.canvas = document.getElementById('screen');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');

    this.playerShip = new PlayerShip();
    this.enemyFleet = new EnemyFleet(this.onGameOver);
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
      //console.log(ticksDelta);

      this.playerShip.update(ticksDelta);
      this.playerShip.render(this.ctx);

      this.enemyFleet.update(ticksDelta);
      this.enemyFleet.render(this.ctx);

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

  onGameOver() {
    this.gameEnded = true;
  }
}

const PLAYER_SHIP_HEIGHT = 20;
const PLAYER_SHIP_WIDTH = 50;
const PLAYER_SHIP_UPDATE_PIXELS_PER_TICK = 7;
const PLAYER_SHIP_RIGHT_BOUND = CANVAS_WIDTH - PLAYER_SHIP_WIDTH;
const PLAYER_SHIP_LEFT_BOUND = 0;

class PlayerShip {
  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  start() {
    this.restart();
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('keydown', this.onKeyDown);
  }

  restart() {
    this.x = (CANVAS_WIDTH - PLAYER_SHIP_WIDTH) / 2;
    this.y = CANVAS_HEIGHT - PLAYER_SHIP_HEIGHT * 1.5;
    this.xVelocity = 0;
    this.arrowsPressed = [];
  }

  update(dt) {
    const newX = Math.max(
      Math.min(this.x + this.xVelocity, PLAYER_SHIP_RIGHT_BOUND), PLAYER_SHIP_LEFT_BOUND);
    this.x = newX;
  }

  render(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x, this.y, PLAYER_SHIP_WIDTH, PLAYER_SHIP_HEIGHT);
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

class EnemyFleet {
  constructor(onGameOver) {
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
    this.updateFrequency = 5;
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

    const liveEnemies = this.enemies.filter( enemy => enemy.isAlive() );

    if (this.needsNextRow) {
      liveEnemies.forEach(enemy => enemy.advanceRow());
      this.needsNextRow = false;
    }
    // if (this.ticksSoFar % (this.updateFrequency * 3) == 0) {
    //   const shooterOne = this.chooseRandomShooter();
    //   if (liveEnemies.length > 3) {
    //     shooterOne.kill();
    //   }
    //   const shooterTwo = this.chooseRandomShooter();
    //   shooterTwo.highlight();
    // }
    // liveEnemies = this.enemies.filter( enemy => enemy.isAlive() );
    if (this.ticksSoFar % this.updateFrequency == 0) {
      liveEnemies.forEach(enemy => enemy.update(dt));
    }
  }

  render(ctx) {
    const liveEnemies = this.enemies.filter( enemy => enemy.isAlive() );
    liveEnemies.forEach(enemy => enemy.render(ctx));
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

class Enemy {
  constructor(startX, startY, onBumpedEdge, onReachedEnd) {
    this.x = startX;
    this.y = startY;
    this.onBumpedEdge = onBumpedEdge;
    this.onReachedEnd = onReachedEnd;
    this.color = 'white';

    this.xVelocity = ENEMY_X_MOVE_WIDTH;
    this.shouldHighlight = false;
    this.highlightTicks = 0;

    this.alive = true;
  }

  advanceRow() {
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

  update(dt) {
    console.assert(this.alive);

    const leftBound = ENEMY_COL_MARGIN;
    const rightBound = CANVAS_WIDTH - ENEMY_BOX_WIDTH - ENEMY_COL_MARGIN;

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
    ctx.fillRect(this.x, this.y, ENEMY_BOX_WIDTH, ENEMY_BOX_HEIGHT);
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
}


////////////////////////////////

const game = new SpaceGame();
game.start();
