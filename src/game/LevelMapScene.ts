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

      // Получаем прогресс уровня, если есть
      const progressData = levelProgress[level.id] || { stars: 0, time: undefined };
      const stars = progressData.stars || 0;
      const unlocked = this.isLevelUnlocked(level.id, levelProgress);

      // Определяем, что писать на кнопке
      let label: string;
      if (level.id % 5 === 0) {
        // Таймерный уровень
        label = progressData.time !== undefined ? `${progressData.time}s` : "⏱";
      } else {
        // Обычный уровень
        label = `${level.id}`;
      }

      // Определяем цвет фона
      let bgColor: string;
      if (level.id % 5 === 0) {
        // Таймерный уровень: зелёный, если пройдено
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
    const prevPackStart = (packIndex - 1) * 5 + 1;
    const prevPackEnd = packIndex * 5;

    let starsSum = 0;
    let allCompleted = true;

    for (let i = 1; i <= prevPackEnd; i++) {
      const stars = progress[i]?.stars || 0;
      starsSum += stars;
      if (stars === 0) allCompleted = false;
    }

    console.log(`Пакет ${prevPackStart}-${prevPackEnd}: ⭐ = ${starsSum}, все пройдены: ${allCompleted}`);
    return allCompleted && starsSum >= packIndex * 6;
  }
}
