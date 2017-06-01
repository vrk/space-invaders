const BARRIER_HEIGHT = 40;
const BARRIER_WIDTH = 70;
const BARRIER_MAX_HEALTH = 10;

class Barrier extends Rectangle {
  constructor(startX, startY) {
    super(startX, startY, BARRIER_WIDTH, BARRIER_HEIGHT)
    this.health = BARRIER_MAX_HEALTH;
  }

  resolveCollisions(bullets) {
    if (bullets.length === 0) {
      return;
    }
    bullets.forEach(bullet => {
      if (this.detectCollision(bullet)) {
        this.health--;
        const height = (this.health / BARRIER_MAX_HEALTH) * this.height;
        const diff = this.height - height;
        this.y += diff;
        this.height = height;
        bullet.kill();
      }
    });
  }

  isAlive() {
    return this.health > 0;
  }

  render(ctx) {
    ctx.fillStyle = 'blueviolet';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
