import { Scene } from 'phaser';
import { GameState } from '../state/GameState.js';

export class CharacterSelect extends Scene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    this.currentPlayer = 1;

    // 🧾 Texto superior
    this.titleText = this.add.text(512, 100, 'Jugador 1: elige tu personaje', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 💡 Animaciones base
    this.anims.create({
      key: 'selectPinky',
      frames: this.anims.generateFrameNames('SelectPinky', {
        prefix: 'SelectPinky ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'selectLamb',
      frames: this.anims.generateFrameNames('SelectLamb', {
        prefix: 'SelectLamb ',
        start: 0,
        end: 2,
        suffix: '.aseprite'
      }),
      frameRate: 8,
      repeat: -1
    });

    // ✨ Sprites de selección
    const pinky = this.add.sprite(300, 384, 'SelectPinky')
      .play('selectPinky')
      .setScale(1.1)
      .setInteractive({ useHandCursor: true });

    const lamb = this.add.sprite(724, 384, 'SelectLamb')
      .play('selectLamb')
      .setScale(1.1)
      .setInteractive({ useHandCursor: true });

    // 🌈 Hover
    const addHoverEffect = (sprite) => {
      sprite.on('pointerover', () => {
        this.tweens.add({ targets: sprite, scale: 1.2, duration: 120 });
        sprite.setTint(0x99ccff);
      });
      sprite.on('pointerout', () => {
        this.tweens.add({ targets: sprite, scale: 1.1, duration: 120 });
        sprite.clearTint();
      });
    };
    addHoverEffect(pinky);
    addHoverEffect(lamb);

    // ⚡ Selección de personaje
    const handleSelection = (character, sprite) => {
      this.tweens.add({
        targets: sprite,
        scale: 1.25,
        duration: 100,
        yoyo: true
      });
      sprite.setTint(0xffff99);
      this.time.delayedCall(300, () => sprite.clearTint());

      if (this.currentPlayer === 1) {
        GameState.player1.character = character;
        this.currentPlayer = 2;
        this.titleText.setText('Jugador 2: elige tu personaje');
      } else {
        GameState.player2.character = character;
        this.scene.start('ModeSelect');
      }
    };

    pinky.on('pointerdown', () => handleSelection('Pinky', pinky));
    lamb.on('pointerdown', () => handleSelection('Lamb', lamb));
  }
}
