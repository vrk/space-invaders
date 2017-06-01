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
