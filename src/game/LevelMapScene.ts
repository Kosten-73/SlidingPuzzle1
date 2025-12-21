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
      const unlocked = this.isLevelUnlocked(level.id, levelProgress);

      const label = level.id % 5 === 0 ? "⏱" : `${level.id}`; // timeLimit
      const btn = this.add.text(x, y, unlocked ? `${label}` : "🔒", {
        backgroundColor: stars > 0 ? "#7CFC90" : unlocked ? "#cccccc" : "#999999",
        color: "#000",
        padding: { x: 6, y: 6 }
      });

      if (unlocked) {
        btn.setInteractive();
        btn.on("pointerdown", () => {
          this.scene.start("Game", { level });
        });
      }
//       btn.setInteractive();
      this.add.text(
        x,
        y + 18,
        "⭐".repeat(stars),
        { fontSize: "10px", color: "#000" }
      );

      btn.on("pointerdown", () => {
        this.scene.start("Game", { level });
      });
    });
  }

  isLevelUnlocked(levelId: number, progress: any): boolean {
    // первые 5 уровней открыты всегда
    if (levelId <= 5) return true;

    const packIndex = Math.floor((levelId - 1) / 5); // 1 для 6–10, 2 для 11–15 ...
    const prevPackStart = (packIndex - 1) * 5 + 1; // 6
    const prevPackEnd = packIndex * 5; // 10

    let starsSum = 0;
    let allCompleted = true;

    for (let i = 1; i <= prevPackEnd; i++) {
      const stars = progress[i] || 0;
      starsSum += stars;
      if (stars === 0) {
        allCompleted = false;
      }
    }
    console.log(
        `Пакет ${prevPackStart}-${prevPackEnd}: ⭐ = ${starsSum}, все пройдены: ${allCompleted}`
      );
    return allCompleted && starsSum >= packIndex * 6;
  }
}
