import { Scene } from 'phaser';
import Background from '../../classes/Background.js';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    // === Fondo reutilizable ===
    const bg = new Background(this);
    bg.create();

    // === Logo del juego ===
    this.add.image(this.scale.width / 2, 250, 'logo').setScale(0.6);

    // === Botón "Comenzar" ===
    const startButton = this.add.text(this.scale.width / 2, 560, 'Comenzar', {
      fontFamily: 'Arial Black',
      fontSize: 40,
      color: '#ff66cc',
      stroke: '#000000',
      strokeThickness: 6,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // === Interacciones visuales ===
    startButton.on('pointerover', () => {
      startButton.setScale(1.1).setColor('#ffffff');
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1).setColor('#ff66cc');
    });

    // === Acción del botón ===
    startButton.on('pointerdown', () => {
      this.scene.start('CharacterSelect'); // Pasa al selector de personajes
    });

    
  }
}
