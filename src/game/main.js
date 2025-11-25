import Phaser, { AUTO } from 'phaser';

// Escenas base
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { CharacterSelect } from './scenes/CharacterSelect.js';
import { ModeSelect } from './scenes/ModeSelect.js';
import { Game } from './scenes/Game.js';
import { HUDScene } from './scenes/HUDScene.js';
import { GameOver } from './scenes/GameOver.js';
import { VictoryScene } from "./scenes/VictoryScene.js";
import { EmpateScene } from "./scenes/EmpateScene.js";

const config = {
  type: Phaser.AUTO,

  // 🎯 Resolución base fija para que el arte no se deforme
  width: 1024,
  height: 720,

  parent: 'game-container',
  backgroundColor: '#43474b',

  scale: {
    mode: Phaser.Scale.FIT,        // 🔥 Mantiene proporciones siempre
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [
    Preloader,
    MainMenu,
    ModeSelect,
    CharacterSelect,
    Game,
    HUDScene,
    GameOver,
    VictoryScene,
    EmpateScene,
  ],

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },

  input: {
    gamepad: true
  }
};
// Función de inicio del juego
const StartGame = (parent) => {
  // ⚠️ Importante: usamos Phaser.Game, no "Game" directamente
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;