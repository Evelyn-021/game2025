import { Scene } from 'phaser';
import { GameState } from '../state/GameState.js';

export class ModeSelect extends Scene {
  constructor() {
    super('ModeSelect');
  }

  create() {
    // 🧾 Texto superior
    this.add.text(512, 120, 'Selecciona el modo de juego', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 🎮 Botones de modo (usando imágenes estáticas)
    const vsBtn = this.add.image(360, 384, 'SelectVersus')
      .setScale(1.1)
      .setInteractive({ useHandCursor: true });

    const coopBtn = this.add.image(664, 384, 'SelectCoop')
      .setScale(1.1)
      .setInteractive({ useHandCursor: true });

    // 🌈 Efecto hover
    const addHoverEffect = (sprite) => {
      sprite.on('pointerover', () => {
        this.tweens.add({
          targets: sprite,
          scale: 1.2,
          duration: 120,
          ease: 'Power2'
        });
        sprite.setTint(0x99ccff);
      });

      sprite.on('pointerout', () => {
        this.tweens.add({
          targets: sprite,
          scale: 1.1,
          duration: 120,
          ease: 'Power2'
        });
        sprite.clearTint();
      });
    };

    addHoverEffect(vsBtn);
    addHoverEffect(coopBtn);

    // ⚡ Efecto y lógica de selección
    const handleSelection = (mode, sprite) => {
      this.tweens.add({
        targets: sprite,
        scale: 1.25,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
      sprite.setTint(0xffff99);
      this.time.delayedCall(300, () => sprite.clearTint());

      GameState.mode = mode;
      this.scene.start('Game');
    };

    vsBtn.on('pointerdown', () => handleSelection('versus', vsBtn));
    coopBtn.on('pointerdown', () => handleSelection('coop', coopBtn));

    // 💫 Efecto de respiración constante (latido suave)
    this.tweens.add({
      targets: [vsBtn, coopBtn],
      scale: 1.12,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
