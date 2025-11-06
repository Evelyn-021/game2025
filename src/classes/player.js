// src/classes/player.js
import Phaser from "phaser";
import { events } from "./GameEvents.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, keys, id) {
    super(scene, x, y, texture);

    // Añade el sprite y la física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Propiedades
    this.id = id; // Identificador único (1 o 2)
    this.keys = keys;
    this.textureName = texture; // "Pinky" o "Lamb"
    this.speed = 160;
    this.jumpStrength = -280;
    this.score = 0;

    this.setCollideWorldBounds(true);

    // Cargar animaciones si no existen
    this.createAnimations(scene);
  }

  update() {
    const { left, right, up } = this.keys;

    if (left.isDown) {
      this.setVelocityX(-this.speed);
      this.flipX = true;
      this.play(`${this.textureName}_walk`, true);
    } else if (right.isDown) {
      this.setVelocityX(this.speed);
      this.flipX = false;
      this.play(`${this.textureName}_walk`, true);
    } else {
      this.setVelocityX(0);
      this.play(`${this.textureName}_idle`, true);
    }

    if (up.isDown && this.body.blocked.down) {
      this.setVelocityY(this.jumpStrength);
      this.play(`${this.textureName}_jump`, true);
    }
  }

  collectDonut() {
    this.score++;
    events.emit("update-score", {
      playerID: this.id,
      playerName: this.textureName,
      score: this.score
    });
  }

  createAnimations(scene) {
    const key = this.textureName;

    // Solo crea una vez cada animación
    if (scene.anims.exists(`${key}_idle`)) return;

    // 🩷 Idle (frames 0–3)
    scene.anims.create({
      key: `${key}_idle`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 0,
        end: 3,
        suffix: ".aseprite"
      }),
      frameRate: 6,
      repeat: -1
    });

    // 💙 Walk (frames 4–9)
    scene.anims.create({
      key: `${key}_walk`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 4,
        end: 9,
        suffix: ".aseprite"
      }),
      frameRate: 10,
      repeat: -1
    });

    // 💨 Jump (frames 10–14)
    scene.anims.create({
      key: `${key}_jump`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 10,
        end: 14,
        suffix: ".aseprite"
      }),
      frameRate: 10,
      repeat: 0
    });
  }
}
