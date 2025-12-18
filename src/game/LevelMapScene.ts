import Phaser from "phaser";
import { Levels } from "./LevelData";

export class LevelMapScene extends Phaser.Scene {
  constructor() {
    super("LevelMap");
  }

  create() {
      const levelProgress = JSON.parse(
        localStorage.getItem("levelProgress") || "{}"
      );

    this.add.text(120, 20, "Выбор уровня", { color: "#000" });

    Levels.forEach((level, i) => {
      const x = 50 + (i % 5) * 65;
      const y = 80 + Math.floor(i / 5) * 45;

      const stars = levelProgress[level.id] || 0;

      const btn = this.add.text(x, y, `${level.id}`, {
        backgroundColor: stars > 0 ? "#7CFC90" : "#cccccc",
        color: "#000000",
        padding: { x: 6, y: 6 }
      });

      this.add.text(
        x,
        y + 18,
        "⭐".repeat(stars),
        { fontSize: "10px", color: "#000" }
      );


      btn.setInteractive();
      btn.on("pointerdown", () => {
        this.scene.start("Game", { level });
      });
    });
  }
}
