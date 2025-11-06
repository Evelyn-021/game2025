import { Scene } from 'phaser';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    // Fondo
    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;

    // Logo del juego
    this.add.image(this.sys.game.config.width / 2, 250, 'logo').setScale(0.6);

    // Botón "Comenzar"
    const startButton = this.add.text(this.sys.game.config.width / 2, 560, 'Comenzar', {
      fontFamily: 'Arial Black',
      fontSize: 40,
      color: '#ff66cc',
      stroke: '#000000',
      strokeThickness: 6,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Interacciones visuales
    startButton.on('pointerover', () => {
      startButton.setScale(1.1).setColor('#ffffff');
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1).setColor('#ff66cc');
    });

    // 🔁 Redirección a la siguiente escena (modo de juego)
    startButton.on('pointerdown', () => {
      this.scene.start('CharacterSelect'); // 👉 Antes iba directo al Game, ahora pasa al selector de personajes
    });

    // Texto de crédito opcional
    this.add.text(this.sys.game.config.width / 2, 720, '© Eve Games 2025', {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}
