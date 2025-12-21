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

    // Кнопка "Начать заново"
    const restartBtn = this.add.text(400, 20, "Начать заново", {
      color: "#fff",
      backgroundColor: "#f00",
      padding: { x: 6, y: 4 }
    }).setInteractive();

    restartBtn.on("pointerdown", () => {
      localStorage.removeItem("levelProgress");
      this.scene.start("LevelMap");
    });

    Levels.forEach((level, i) => {
      const x = 50 + (i % 5) * 65;
      const y = 80 + Math.floor(i / 5) * 45;

      const progressData = levelProgress[level.id] || { stars: 0, time: undefined };
      const stars = progressData.stars || 0;
      const unlocked = this.isLevelUnlocked(level.id, levelProgress);

      let label: string;
      if (level.id % 5 === 0) {
        label = progressData.time !== undefined ? `${progressData.time}s` : "⏱";
      } else if (level.id % 4 === 0) {
          label = "?"
      }
      else {
        label = `${level.id}`;
      }

      let bgColor: string;
      if (level.id % 5 === 0) {
        bgColor = progressData.time !== undefined ? "#7CFC90" : unlocked ? "#cccccc" : "#999999";
      } else {
        // Обычный уровень: зелёный если stars > 0
        bgColor = stars > 0 ? "#7CFC90" : unlocked ? "#cccccc" : "#999999";
      }

      const btn = this.add.text(x, y, unlocked ? label : "🔒", {
        backgroundColor: bgColor,
        color: "#000",
        padding: { x: 6, y: 6 },
      });

      if (unlocked) {
        btn.setInteractive();
        btn.on("pointerdown", () => {
          this.scene.start("Game", { level });
        });
      }

      // Звёздочки под кнопкой (только если обычный уровень или таймерный уже пройден)
      const starsToShow = stars > 0 ? "⭐".repeat(stars) : "";
      this.add.text(x, y + 18, starsToShow, { fontSize: "10px", color: "#000" });
    });
  }

  isLevelUnlocked(levelId: number, progress: any): boolean {
    if (levelId <= 5) return true;

    const packIndex = Math.floor((levelId - 1) / 5);
    const prevPackEnd = packIndex * 5;

    let starsSum = 0;
    let allCompleted = true;

    for (let i = 1; i <= prevPackEnd; i++) {
      const stars = progress[i]?.stars || 0;
      starsSum += stars;
      if (stars === 0) allCompleted = false;
    }

    return allCompleted && starsSum >= packIndex * 6;
  }
}
