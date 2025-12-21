import { LevelType } from "./LevelTypes";

export const Levels = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  size: i < 10 ? 3 : i < 20 ? 4 : i < 25 ? 5 : 6,   // 3x3, 4x4, 5x5, 6x6
  type: i % 4,
  maxMoves: 30 + i * 2,
  timeLimit: 60 + i * 5,
  scoreTarget: 1000 + i * 200
}));
