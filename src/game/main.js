import Phaser, { AUTO } from 'phaser';

// Escenas base
import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { ModeSelect } from './scenes/ModeSelect.js';
import { CharacterSelect } from './scenes/CharacterSelect.js';
import { VersusScene } from "./scenes/VersusScene.js";
import { Game } from './scenes/Game.js';
import { HUDScene } from './scenes/HUDScene.js';
import { GameOver } from './scenes/GameOver.js';
import { VictoryScene } from "./scenes/VictoryScene.js";
import { EmpateScene } from "./scenes/EmpateScene.js";

// Configuración del juego
const config = {
  type: AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#43474bff',

  // Ajuste de escala para pantallas de distintos tamaños
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // ⚙️ Registro de todas tus escenas
  scene: [
    Boot,
    Preloader,
    MainMenu,
    ModeSelect,
    CharacterSelect,
    VersusScene,
    Game,
    HUDScene,
    GameOver,
    VictoryScene,
    EmpateScene,
  ],

  // 🧲 Configuración de físicas (arcade simple)
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false,
    },
  },

  // ✅ AGREGAR ESTO: Configuración de input para habilitar gamepads
  input: {
    gamepad: true  // Esto habilita el plugin de gamepad
  }
};

// Función de inicio del juego
const StartGame = (parent) => {
  // ⚠️ Importante: usamos Phaser.Game, no "Game" directamente
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;