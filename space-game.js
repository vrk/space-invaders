const FPS = 60;
const SECONDS_PER_TICK = 1 / FPS;

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
