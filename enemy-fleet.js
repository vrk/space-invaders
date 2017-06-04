const ENEMY_BOX_HEIGHT = 20;
const ENEMY_BOX_WIDTH = 30;
const ENEMY_COL_MARGIN = 7;
const ENEMY_ROW_MARGIN = 18;
const NUMBER_COLUMNS = 11;
const NUMBER_ROWS = 5;
const FLEET_START_Y = 20;
const FLEET_WIDTH = (NUMBER_COLUMNS - 1) * ENEMY_COL_MARGIN + NUMBER_COLUMNS * ENEMY_BOX_WIDTH
const FLEET_START_X = (FLEET_WIDTH - 2 * ENEMY_COL_MARGIN) / 4;
const UPDATE_FREQUENCY_START = 45;
const UPDATE_FREQUENCY_MIN = 4;
const ENEMY_SHOOT_PROBABILTY = 0.5;
const ENEMY_MAYBE_SHOOT_FREQUENCY = 120;


class EnemyFleet {
  constructor(onNewBullet) {
    this.onNewBullet = onNewBullet;

    this.onBumpedEdge = this.onBumpedEdge.bind(this);
    this.onReachedEnd = this.onReachedEnd.bind(this);
    this.numberKilled = 0;
  }

  start() {
    this.restart();
  }


  restart() {
    // All living invaders in a list.
    this.enemies = [];
    // All enemies (living and dead) stored by position in grid
    this.enemiesByColRow = [];

    this.ticksSoFar = 0;
    this.ticksSinceLastSpeedUp = 0;
    this.updateFrequency = UPDATE_FREQUENCY_START;
    this.needsNextRow = false;
    this.conquered = false;

    for (let col = 0; col < NUMBER_COLUMNS; col++) {
      const startX = FLEET_START_X + (ENEMY_BOX_WIDTH + ENEMY_COL_MARGIN) * col;
      this.enemiesByColRow[col] = [];
      for (let row = 0; row < NUMBER_ROWS; row++) {
        const startY = FLEET_START_Y + (ENEMY_BOX_HEIGHT + ENEMY_ROW_MARGIN) * row;
        const enemy = new Enemy(startX, startY, this.onBumpedEdge, this.onReachedEnd);
        this.enemies.push(enemy);
        this.enemiesByColRow[col].push(enemy);
      }
    }
  }

  resolveCollisions(bullet) {
    if (!bullet) {
      return;
    }

    this.enemies.forEach((enemy) => {
      if (enemy.detectCollision(bullet)) {
        enemy.kill();
        bullet.kill();
        this.numberKilled++;
      }
    });
    this.enemies = this.enemies.filter(enemy => enemy.isAlive());
  }

  update(dt) {
    this.ticksSoFar += dt;
    this.ticksSinceLastSpeedUp += dt;

    // Choose a random shooter.

    if (this.ticksSoFar % (ENEMY_MAYBE_SHOOT_FREQUENCY) === 0) {
      const SHOTS_FIRED = 2;
      for (let i = 0; i < SHOTS_FIRED; i++) {
        const shouldShoot = Math.random() < ENEMY_SHOOT_PROBABILTY;
        if (shouldShoot) {
          const shooter = this.chooseRandomShooter();
          const bullet = shooter.createBullet();
          this.onNewBullet(bullet);
          console.log('render');
          shooter.highlight();
        }
      }
    }

    if (this.ticksSinceLastSpeedUp % this.updateFrequency === 0) {
      console.log(this.updateFrequency);
      if (this.needsNextRow) {
        this.enemies.forEach(enemy => enemy.advanceY());
        this.needsNextRow = false;
      } else {
        this.enemies.forEach(enemy => enemy.advanceX(dt));
      }
      if (this.numberKilled > 0) {
        this.updateFrequency =
            Math.max(this.updateFrequency - this.numberKilled, UPDATE_FREQUENCY_MIN);
        this.ticksSinceLastSpeedUp = 0;
        this.numberKilled = 0;
      }
    }
  }

  render(ctx) {
    this.enemies.forEach(enemy => enemy.render(ctx));
  }

  hasConquered() {
    return this.conquered;
  }

  // Private methods
  onBumpedEdge() {
    this.needsNextRow = true;
  }

  onReachedEnd() {
    this.conquered = true;
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
