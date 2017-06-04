const ENEMY_X_MOVE_WIDTH = 5;
const TICKS_HIGHLIGHTED = 10;

class Enemy extends Rectangle {
  constructor(startX, startY, onBumpedEdge, onReachedEnd) {
    super(startX, startY, ENEMY_BOX_WIDTH, ENEMY_BOX_HEIGHT);
    this.onBumpedEdge = onBumpedEdge;
    this.onReachedEnd = onReachedEnd;
    this.color = 'white';

    this.xVelocity = ENEMY_X_MOVE_WIDTH;
    this.shouldHighlight = false;
    this.highlightTicks = 0;

    this.alive = true;
  }

  advanceY() {
    console.assert(this.alive);

    // Reverse direction.
    this.xVelocity *= -1;

    // Attempt to advance the row.
    const newY = this.y + ENEMY_ROW_MARGIN;
    const bound = CANVAS_HEIGHT - ENEMY_BOX_HEIGHT * 4;
    if (newY >= bound) {
      this.onReachedEnd();
    } else {
      this.y = newY;
    }
  }

  advanceX(dt) {
    console.assert(this.alive);

    const leftBound = ENEMY_COL_MARGIN;
    const rightBound = CANVAS_WIDTH - this.width - ENEMY_COL_MARGIN;

    const newX = this.x + this.xVelocity;
    const nextX = this.x + 2 * this.xVelocity;

    // Notify fleet if we've bumped into the edge.
    if (nextX > rightBound || nextX < leftBound) {
      this.onBumpedEdge();
    }
    console.assert(newX >= leftBound);
    console.assert(newX <= rightBound);
    this.x = newX;
  }

  render(ctx) {
    console.assert(this.alive);

    // Update color if we're supposed to be highlighted.
    if (this.shouldHighlight) {
      if (this.highlightTicks >= TICKS_HIGHLIGHTED) {
        this.highlightTicks = 0;
        this.shouldHighlight = false;
        this.color = 'white';
      } else {
        if (this.highlightTicks === 0) {
          this.color = 'red';
        }
        this.highlightTicks++;
      }
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  highlight() {
    console.assert(this.alive);
    this.shouldHighlight = true;
  }

  kill() {
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }

  createBullet() {
    const bulletX = this.x + this.width / 2;
    const bulletY = this.y + this.height / 2;
    return new Bullet(bulletX, bulletY);
  }
}
