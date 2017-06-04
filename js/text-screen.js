const LINE_HEIGHT = 30;
class TextWriter {
  constructor(context) {
    this.ctx = context;
    this.y = CANVAS_HEIGHT / 3;
    this.color = 'white';
  }

  setColor(color) {
    this.color = color;
  }

  writeLine(textInput) {
    const text = textInput || '';
    this.ctx.fillStyle = this.color;
    this.ctx.font = '20px Consolas, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, CANVAS_WIDTH / 2, this.y);
    this.y += LINE_HEIGHT;
  }
}
