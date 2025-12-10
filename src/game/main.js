import Phaser, { AUTO } from 'phaser';

// Escenas base
import { Preloader } from './scenes/Preloader.js';
import Login from "/src/game/scenes/Login.js";
import FirebasePlugin from "./../plugins/FirebasePlugin.js";
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

    plugins: {
    global: [
      {
        key: "FirebasePlugin",
        plugin: FirebasePlugin,
        start: true,
        mapping: "firebase",
      },
    ],
  },

  parent: 'game-container',
  backgroundColor: '#43474b',

  scale: {
    mode: Phaser.Scale.RESIZE,             // se adapta a la ventana
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true,
  },

  render: {
    pixelArt: true,     // 🔥 Mantiene píxeles definidos
    antialias: false,
    roundPixels: true,
  },

  scene: [
    Preloader,
    Login,
    MainMenu,
    ModeSelect,
    CharacterSelect,
    Game,
    HUDScene,
    GameOver,
    VictoryScene,
    EmpateScene,
  ],

  dom: {
        createContainer: true
    },
    
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
