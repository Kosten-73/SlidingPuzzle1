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

  constructor() {
    super("Game");
  }

  init(data: any) {
    this.levelData = data.level;
    this.puzzle = new Puzzle(this.levelData.size);
    this.moves = 0;
  }

  create() {
    // Разрешаем AudioContext после первого клика
    this.input.once('pointerdown', () => {
      this.sound.context.resume().then(() => {
        console.log('AudioContext resumed!');
      });
    });

    // Кнопка "Назад"
    this.backBtn = this.add.text(10, 10, "← Назад", {
      color: "#000",
      backgroundColor: "#dddddd",
      padding: { x: 6, y: 4 }
    }).setInteractive({ useHandCursor: true });
    this.backBtn.on("pointerdown", () => {
      if (this.timerEvent) this.timerEvent.remove(false);
      this.scene.start("LevelMap");
    });

    // Счётчики ходов и звёзд
    this.movesText = this.add.text(120, 10, `Ходы: ${this.moves}`, { color: "#000" });
    this.starsText = this.add.text(120, 30, this.getStarsPreview(), { color: "#000" });

    // Таймер для каждого пятого уровня
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
            this.time.delayedCall(1000, () => {
              this.scene.start("LevelMap");
            });
          }
        }
      });
    }

    this.drawPuzzle();
  }

  drawPuzzle() {
    // Удаляем плитки, но оставляем UI элементы
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
        if (this.puzzle.move(i)) {
          this.moves++;
          this.movesText.setText(`Ходы: ${this.moves}`);
          this.starsText.setText(this.getStarsPreview());

          if (this.puzzle.isSolved()) {
            const stars = this.calculateStars();
            this.saveProgress(this.levelData.id, stars);

            if (this.timerEvent) this.timerEvent.remove(false);

            this.add.text(120, 70, `Уровень пройден! ⭐${"⭐".repeat(stars)}`, { color: "#00aa00" });
            this.time.delayedCall(1000, () => this.scene.start("LevelMap"));
          }

          this.drawPuzzle();
        }
      });
    });
  }

  saveProgress(levelId: number, stars: number) {
    const progress = JSON.parse(localStorage.getItem("levelProgress") || "{}");
    const previousStars = progress[levelId] || 0;
    progress[levelId] = Math.max(previousStars, stars);
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
