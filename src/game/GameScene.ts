import Phaser from "phaser";
import { Puzzle } from "./Puzzle";

export class GameScene extends Phaser.Scene {
  movesText!: Phaser.GameObjects.Text;
  starsText!: Phaser.GameObjects.Text;
  backBtn!: Phaser.GameObjects.Text;
  timerText!: Phaser.GameObjects.Text;
  timeLeft!: number;
  timerEvent!: Phaser.Time.TimerEvent;

  puzzle!: Puzzle;
  tileSize = 60;
  moves = 0;
  levelData: any;

  idleTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("Game");
  }

  init(data: any) {
    this.levelData = data.level;
    this.puzzle = new Puzzle(this.levelData.size);
    this.moves = 0;
  }

  create() {
    this.input.once('pointerdown', () => {
      this.sound.context.resume();
    });

    this.backBtn = this.add.text(10, 10, "← Назад", {
      color: "#000",
      backgroundColor: "#dddddd",
      padding: { x: 6, y: 4 }
    }).setInteractive({ useHandCursor: true });

    this.backBtn.on("pointerdown", () => {
      if (this.timerEvent) this.timerEvent.remove(false);
      if (this.idleTimer) this.idleTimer.remove(false);
      this.scene.start("LevelMap");
    });

    this.movesText = this.add.text(120, 10, `Ходы: ${this.moves}`, { color: "#000" });
    this.starsText = this.add.text(120, 30, this.getStarsPreview(), { color: "#000" });

    // Таймер для 5-го уровня
    if (this.levelData.id % 5 === 0 && this.levelData.timeLimit > 0) {
      this.timeLeft = this.levelData.timeLimit;
      this.timerText = this.add.text(220, 10, `Время: ${this.timeLeft}`, { color: "#f00" });

      this.timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          this.timeLeft--;
          this.timerText.setText(`Время: ${this.timeLeft}`);

          if (this.timeLeft <= 0) {
            this.timerEvent.remove(false);
            this.timerText.setText("Время закончилось!");
            this.time.delayedCall(1000, () => this.scene.start("LevelMap"));
          }
        }
      });
    }

    this.resetIdleTimer(); // стартуем таймер простоя для 3-го уровня

    this.drawPuzzle();
  }

  resetIdleTimer() {
    if (this.levelData.id % 4 === 0) {
      if (this.idleTimer) this.idleTimer.remove(false);

      this.idleTimer = this.time.addEvent({
        delay: 1000,
        loop: false,
        callback: () => {
          if (this.timerEvent) this.timerEvent.remove(false);
          this.add.text(10, 470, "Делайте ход быстрее чем один раз в сек!", { color: "#ff0000" });
          this.time.delayedCall(1000, () => this.scene.start("LevelMap"));
        }
      });
    }
  }

  drawPuzzle() {
    this.children.list
      .filter(obj =>
        obj !== this.movesText &&
        obj !== this.starsText &&
        obj !== this.backBtn &&
        obj !== this.timerText
      )
      .forEach(obj => obj.destroy());

    this.puzzle.tiles.forEach((value, i) => {
      if (value === 0) return;

      const row = Math.floor(i / this.puzzle.size);
      const col = i % this.puzzle.size;

      const x = 50 + col * this.tileSize;
      const y = 80 + row * this.tileSize;

      const tile = this.add.rectangle(
        x, y,
        this.tileSize - 4,
        this.tileSize - 4,
        0x999999
      );

      this.add.text(x - 10, y - 12, value.toString(), { color: "#000" });

      tile.setInteractive();
      tile.on("pointerdown", () => {
        this.resetIdleTimer(); // сброс таймера простоя

        if (this.puzzle.move(i)) {
          this.moves++;
          this.movesText.setText(`Ходы: ${this.moves}`);
          this.starsText.setText(this.getStarsPreview());

          if (this.puzzle.isSolved()) {
            const stars = this.calculateStars();
            let timeUsed: number | undefined = undefined;
            if (this.levelData.id % 5 === 0 && this.levelData.timeLimit > 0) {
              timeUsed = this.levelData.timeLimit - this.timeLeft;
            }

            if (this.timerEvent) this.timerEvent.remove(false);
            if (this.idleTimer) this.idleTimer.remove(false);

            this.saveProgress(this.levelData.id, stars, timeUsed);

            this.add.text(120, 70, `Уровень пройден! ${"⭐".repeat(stars)}`, { color: "#00aa00" });
            this.time.delayedCall(1000, () => this.scene.start("LevelMap"));
          }

          this.drawPuzzle();
        }
      });
    });
  }

  saveProgress(levelId: number, stars: number, timePassed?: number) {
    const progress = JSON.parse(localStorage.getItem("levelProgress") || "{}");
    const previousData = progress[levelId] || { stars: 0, time: undefined };

    progress[levelId] = {
      stars: Math.max(previousData.stars, stars),
      time: timePassed !== undefined ? timePassed : previousData.time
    };

    localStorage.setItem("levelProgress", JSON.stringify(progress));
  }

  calculateStars(): number {
    const maxMoves = this.levelData.maxMoves;
    if (this.moves <= maxMoves) return 3;
    if (this.moves <= maxMoves * 2) return 2;
    return 1;
  }

  getStarsPreview(): string {
    const maxMoves = this.levelData.maxMoves;
    if (this.moves <= maxMoves) return "⭐⭐⭐";
    if (this.moves <= maxMoves * 2) return "⭐⭐☆";
    return "⭐☆☆";
  }
}
