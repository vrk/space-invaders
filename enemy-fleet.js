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
