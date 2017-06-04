const X_POSITION = CANVAS_WIDTH - 10;
const Y_POSITION = 30;
class ScoreKeeper {
  constructor() {
    this.score = 0;
  }

  update() {
    this.score += 10;
  }

  render(ctx) {
    ctx.fillStyle = 'blueviolet';
    ctx.font = '20px Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${this.score}`, X_POSITION, Y_POSITION);
  }

  getScore() {
    return this.score;
  }
}
