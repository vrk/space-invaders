const FPS = 60;
const SECONDS_PER_TICK = 1 / FPS;

class SpaceGame {
  constructor() {
    this.onNewEnemyBullet = this.onNewEnemyBullet.bind(this);

    this.startTime = null;
    this.gameEnded = false;
    this.canvas = document.getElementById('screen');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');

    this.playerShip = new PlayerShip();
    this.enemyFleet = new EnemyFleet(this.onNewEnemyBullet);
    this.barriers = this.constructBarriers();
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

      this.barriers.forEach(barrier => barrier.render(this.ctx));

      // Update bullet positions.
      this.enemyBullets.forEach(bullet => bullet.update(ticksDelta));
      this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isAlive());
      this.enemyBullets.forEach(bullet => bullet.render(this.ctx));

      // Resolve enemy bullet collisions.
      this.playerShip.resolveCollisions(this.enemyBullets);
      this.barriers.forEach(
          barrier => barrier.resolveCollisions(this.enemyBullets));
      this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isAlive());
      this.barriers = this.barriers.filter(barrier => barrier.isAlive());

      ticksLastTime = ticksSinceStart;
      if (!this.enemyFleet.hasConquered() && this.playerShip.isAlive()) {
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

  constructBarriers() {
    const BARRIER_MARGIN = 50;
    const NUMBER_BARRIERS = 4;
    const BARRIER_Y_POSITION = CANVAS_HEIGHT * 0.75;

    const barriers = [];

    const maxWidth = CANVAS_WIDTH - BARRIER_MARGIN * 2;
    const sectionWidth = maxWidth / NUMBER_BARRIERS;
    const xOffset = (sectionWidth - BARRIER_WIDTH) / 2;

    for (let i = 0; i < NUMBER_BARRIERS; i++) {
      const barrier = new Barrier(i * (sectionWidth) + xOffset + BARRIER_MARGIN, BARRIER_Y_POSITION);
      barriers.push(barrier);
    }
    return barriers;
  }
}
