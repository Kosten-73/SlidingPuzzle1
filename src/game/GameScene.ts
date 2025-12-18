import Phaser from "phaser";
import { Puzzle } from "./Puzzle";

export class GameScene extends Phaser.Scene {
  movesText!: Phaser.GameObjects.Text;
  starsText!: Phaser.GameObjects.Text;

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
    this.movesText = this.add.text(10, 10, `Ходы: ${this.moves}`, { color: "#000" });
    this.starsText = this.add.text(10, 30, this.getStarsPreview(), { color: "#000" });

    this.drawPuzzle();
  }

  drawPuzzle() {
    this.children.list
      .filter(obj => obj !== this.movesText && obj !== this.starsText)
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

      const text = this.add.text(x - 10, y - 12, value.toString(), {
        color: "#000"
      });

      tile.setInteractive();
      tile.on("pointerdown", () => {
        if (this.puzzle.move(i)) {
          this.moves++;
          this.movesText.setText(`Ходы: ${this.moves}`);
          this.starsText.setText(this.getStarsPreview());
          if (this.puzzle.isSolved()) {
            const stars = this.calculateStars();
            this.saveProgress(this.levelData.id, stars);
            alert(`Уровень пройден! Звёзды: ${"⭐".repeat(stars)}`);
            this.scene.start("LevelMap");
          }
          this.drawPuzzle();
        }
      });
    });
  }
    saveProgress(levelId: number, stars: number) {
      const progress = JSON.parse(
        localStorage.getItem("levelProgress") || "{}"
      );

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
