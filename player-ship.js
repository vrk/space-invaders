const PLAYER_SHIP_HEIGHT = 20;
const PLAYER_SHIP_WIDTH = 50;
const PLAYER_SHIP_UPDATE_PIXELS_PER_TICK = 5;
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

  isAlive() {
    return this.health > 0;
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
