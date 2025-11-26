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

  // 🔥 Resolución base ideal para pixel-art
  width: 800,
  height: 600,

  parent: 'game-container',
  backgroundColor: '#43474b',

  scale: {
    // 🔥 Modos similares al proyecto de tus compañeros PERO sin perder pixel-perfect
    mode: Phaser.Scale.RESIZE,             // se adapta a la ventana
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
  },

  render: {
    pixelArt: true,     // 🔥 Mantiene tus píxeles definidos
    antialias: false,
    roundPixels: true,
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
      debug: false
    },
  },

  input: {
    gamepad: true
  }
};

// Función para iniciar el juego
const StartGame = (parent) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
