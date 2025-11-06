import Phaser, { AUTO } from 'phaser';

// Escenas base
import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { ModeSelect } from './scenes/ModeSelect.js';
import { CharacterSelect } from './scenes/CharacterSelect.js';
import { Game } from './scenes/Game.js';
import { HUDScene } from './scenes/HUDScene.js';
import { GameOver } from './scenes/GameOver.js';

// Configuración del juego
const config = {
  type: AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#028af8',

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
    Game,
    HUDScene,
    GameOver,
  ],

  // 🧲 Configuración de físicas (arcade simple)
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false,
    },
  },
};

// Función de inicio del juego
const StartGame = (parent) => {
  // ⚠️ Importante: usamos Phaser.Game, no "Game" directamente
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;
