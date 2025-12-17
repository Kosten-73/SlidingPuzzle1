import Phaser from "phaser";
import { Puzzle } from "./Puzzle";

export class GameScene extends Phaser.Scene {
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
    this.drawPuzzle();
    this.add.text(10, 10, `Ходы: ${this.moves}`, { color: "#000" });
  }

  drawPuzzle() {
    this.children.removeAll();

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
          if (this.puzzle.isSolved()) {
            this.saveProgress(this.levelData.id);
            alert("Уровень пройден!");
            this.scene.start("LevelMap");
          }
          this.drawPuzzle();
        }
      });
    });
  }
    saveProgress(levelId: number) {
      const completed = JSON.parse(
        localStorage.getItem("completedLevels") || "[]"
      );

      if (!completed.includes(levelId)) {
        completed.push(levelId);
        localStorage.setItem("completedLevels", JSON.stringify(completed));
      }
    }
}
