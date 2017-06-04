const PLAYER_BULLET_Y_VELOCITY = 9;
const PLAYER_BULLET_SIZE = 5;

class PlayerBullet extends Rectangle {
  constructor(startX, startY) {
    super(startX, startY, PLAYER_BULLET_SIZE, PLAYER_BULLET_SIZE);
    this.color = 'white';

    this.yVelocity = -PLAYER_BULLET_Y_VELOCITY;
    this.alive = true;
  }

  update(dt) {
    console.assert(this.alive);
    const yBound = 0;
    const newY = this.y + this.yVelocity;

    if (newY < yBound) {
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
