export class Puzzle {
  size: number;
  tiles: number[];
  emptyIndex: number;

  constructor(size: number) {
    this.size = size;
    this.tiles = [];
    this.emptyIndex = size * size - 1;

    for (let i = 1; i < size * size; i++) {
      this.tiles.push(i);
    }
    this.tiles.push(0);

    this.shuffle();
  }

  shuffle() {
    for (let i = 0; i < 200; i++) {
      const moves = this.getPossibleMoves();
      const move = moves[Math.floor(Math.random() * moves.length)];
      this.move(move);
    }
  }

  getPossibleMoves(): number[] {
    const moves: number[] = [];
    const row = Math.floor(this.emptyIndex / this.size); // строка
    const col = this.emptyIndex % this.size; // столбец

    if (row > 0) moves.push(this.emptyIndex - this.size); // вверх
    if (row < this.size - 1) moves.push(this.emptyIndex + this.size); // вниз
    if (col > 0) moves.push(this.emptyIndex - 1); // влево
    if (col < this.size - 1) moves.push(this.emptyIndex + 1); // вправо

    return moves;
  }

  move(index: number): boolean {
    if (!this.getPossibleMoves().includes(index)) return false;

    [this.tiles[this.emptyIndex], this.tiles[index]] =
      [this.tiles[index], this.tiles[this.emptyIndex]];

    this.emptyIndex = index;
    return true;
  }

  isSolved(): boolean {
    for (let i = 0; i < this.tiles.length - 1; i++) {
      if (this.tiles[i] !== i + 1) return false;
    }
    return true;
  }
}
