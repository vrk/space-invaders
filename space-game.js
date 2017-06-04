const FPS = 60;
const SECONDS_PER_TICK = 1 / FPS;

class SpaceGame {
  constructor() {
    this.onNewEnemyBullet = this.onNewEnemyBullet.bind(this);
    this.onNewPlayerBullet = this.onNewPlayerBullet.bind(this);

    this.startTime = null;
    this.gameEnded = false;
    this.canvas = document.getElementById('screen');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');

    this.playerShip = new PlayerShip(this.onNewPlayerBullet);
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

  onNewPlayerBullet(bullet) {
    this.playerBullet = bullet;
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
