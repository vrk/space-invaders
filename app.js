class App {
  constructor() {
    this.gameOver = this.gameOver.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.canvas = document.querySelector('#screen');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');

    this.game = new SpaceGame(this.canvas, this.gameOver);

    const textScreen = new TextWriter(this.ctx);
    textScreen.writeLine('BLOCK INVADERS');
    textScreen.writeLine('Press space to start');
    this.listenForStartGame();
  }

  // Private methods
  gameOver(score) {
    this.clearScreen();
    const textScreen = new TextWriter(this.ctx);
    textScreen.writeLine('GAME OVER');
    textScreen.writeLine(`SCORE: ${score}`);
    textScreen.writeLine();
    textScreen.writeLine('Press space to play again');

    this.listenForStartGame();
  }

  clearScreen() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  listenForStartGame() {
    document.addEventListener('keyup', this.onKeyUp);
  }

  onKeyUp(event) {
    const key = event.key;
    if (key === ' ') {
      this.startGame();
    }
  }

  startGame() {
    document.removeEventListener('keyup', this.onKeyUp);
    this.game.start(this.canvas);
  }
}
