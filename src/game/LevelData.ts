export const Levels = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  size: i < 10 ? 3 : i < 20 ? 4 : i < 25 ? 5 : 6,   // 3x3, 4x4, 5x5, 6x6
  maxMoves: 30 + i * 2,
  timeLimit: i % 5 === 4 ? 10 * (i + 1) : 0, // только каждый 5-й уровень
}));
