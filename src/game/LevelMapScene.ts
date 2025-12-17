import Phaser from "phaser";
import { Levels } from "./LevelData";

export class LevelMapScene extends Phaser.Scene {
  constructor() {
    super("LevelMap");
  }

  create() {
      const completedLevels: number[] = JSON.parse(
        localStorage.getItem("completedLevels") || "[]"
      );

    this.add.text(120, 20, "Выбор уровня", { color: "#000" });

    Levels.forEach((level, i) => {
      const x = 50 + (i % 5) * 65;
      const y = 80 + Math.floor(i / 5) * 45;

      const isCompleted = completedLevels.includes(level.id);

      const btn = this.add.text(x, y, `${level.id}`, {
        backgroundColor: isCompleted ? "#7CFC90" : "#cccccc",
        color: "#000000",
        padding: { x: 6, y: 6 }
      });

      btn.setInteractive();
      btn.on("pointerdown", () => {
        this.scene.start("Game", { level });
      });
    });
  }
}
