const FPS = 60;
const SECONDS_PER_TICK = 1 / FPS;

class SpaceGame {
  constructor(canvas, onGameOver) {
    this.onNewEnemyBullet = this.onNewEnemyBullet.bind(this);
    this.onNewPlayerBullet = this.onNewPlayerBullet.bind(this);
    this.onEnemyKilled = this.onEnemyKilled.bind(this);

    this.onGameOver = onGameOver;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  start() {
    this.playerShip = new PlayerShip(this.onNewPlayerBullet);
    this.enemyFleet = new EnemyFleet(this.onNewEnemyBullet, this.onEnemyKilled);
    this.barriers = this.constructBarriers();
    this.enemyBullets = [];
    this.scoreKeeper = new ScoreKeeper();

    // Initialize objects.
    this.playerShip.start();
    this.enemyFleet.start();

    // Begin loop.
    this.startGameLoop();
  }

  stop() {
    this.playerShip.stop();
    this.onGameOver(this.scoreKeeper.getScore());
  }

  nextLevel() {
    this.playerShip.restart();
    this.enemyFleet.restart();
    this.enemyBullets = [];
    this.playerBullet = null;
  }

  startGameLoop() {
    const startTime = performance.now();

    let ticksLastTime = 0;
    const gameLoop = (timestamp) => {
      this.clearScreen();
      const secondsSinceStart = (timestamp - startTime) / 1000;
      const ticksSinceStart = Math.floor(secondsSinceStart / SECONDS_PER_TICK);
      const ticksDelta = ticksSinceStart - ticksLastTime;

      this.playerShip.update(ticksDelta);
      this.playerShip.render(this.ctx);

      this.enemyFleet.update(ticksDelta);
      this.enemyFleet.render(this.ctx);

      this.barriers.forEach(barrier => barrier.render(this.ctx));

      this.scoreKeeper.render(this.ctx);

      // Look to see if there's a player bullet, and update if so.
      if (this.playerBullet) {
        this.playerBullet.update(ticksDelta);
      }
      this.filterBulletsByLiving();
      if (this.playerBullet) {
        this.playerBullet.render(this.ctx);
      }

      // Update bullet positions.
      this.enemyBullets.forEach(bullet => bullet.update(ticksDelta));
      this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isAlive());
      this.enemyBullets.forEach(bullet => bullet.render(this.ctx));

      // Resolve player bullet collisions.
      this.enemyFleet.resolveCollisions(this.playerBullet);

      // Resolve enemy bullet collisions.
      this.playerShip.resolveCollisions(this.enemyBullets);

      // Filter bullets by living.
      this.filterBulletsByLiving();

      // Resolve collisions to barriers: either bullet can collide into it.
      this.barriers.forEach(
          barrier => barrier.resolveEnemyCollisions(this.enemyBullets));
      this.barriers.forEach(
          barrier => barrier.resolvePlayerCollisions(this.playerBullet));
      this.barriers = this.barriers.filter(barrier => barrier.isAlive());

      // Filter bullets by living.
      this.filterBulletsByLiving();

      ticksLastTime = ticksSinceStart;
      if (!this.enemyFleet.hasConquered() && this.playerShip.isAlive()) {
        if (this.enemyFleet.isDefeated()) {
          this.nextLevel();
        }
        requestAnimationFrame(gameLoop);
      } else {
        // Game over
        this.stop();
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

  onNewPlayerBullet(bullet) {
    this.playerBullet = bullet;
  }

  onEnemyKilled() {
    this.scoreKeeper.update();
  }

  constructBarriers() {
    const BARRIER_MARGIN = 10;
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

  filterBulletsByLiving() {
    // Filter bullets by living.
    this.enemyBullets = this.enemyBullets.filter(bullet => bullet.isAlive());
    if (this.playerBullet && !this.playerBullet.isAlive()) {
      this.playerBullet = null;
    }
  }
}
