import Phaser from "phaser";
import { LevelMapScene } from "./game/LevelMapScene";
import { GameScene } from "./game/GameScene";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 400,
  height: 600,
  backgroundColor: "#f0f0f0",
  scene: [LevelMapScene, GameScene]
});
