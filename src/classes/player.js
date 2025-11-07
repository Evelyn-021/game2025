import Phaser from "phaser";
import { events } from "./GameEvents.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, keys, id) {
    super(scene, x, y, texture);

    // === CONFIGURACIÓN BÁSICA ===
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.id = id; // 1 o 2
    this.keys = keys; // teclas asignadas
    this.textureName = texture; // "Pinky" o "Lamb"
    this.speed = 160;
    this.jumpStrength = -280;
    this.score = 0;
    this.canMove = true; // ✅ se puede mover por defecto
    this.setCollideWorldBounds(true);

    // === ANIMACIONES ===
    this.createAnimations(scene);
  }

  update() {
    // 🚫 si no puede moverse (por combo o stun), no hace nada
    if (!this.canMove) {
      this.setVelocityX(0);
      this.play(`${this.textureName}_idle`, true);
      return;
    }

    const { left, right, up } = this.keys;

    // === MOVIMIENTO HORIZONTAL ===
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

    // === SALTO ===
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
      score: this.score,
    });
  }

  // === CREACIÓN DE ANIMACIONES ===
  createAnimations(scene) {
    const key = this.textureName;

    // Evita duplicar animaciones si ya existen
    if (scene.anims.exists(`${key}_idle`)) return;

    // 🩷 Idle (frames 0–3)
    scene.anims.create({
      key: `${key}_idle`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 0,
        end: 3,
        suffix: ".aseprite",
      }),
      frameRate: 6,
      repeat: -1,
    });

    // 💙 Walk (frames 4–9)
    scene.anims.create({
      key: `${key}_walk`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 4,
        end: 9,
        suffix: ".aseprite",
      }),
      frameRate: 10,
      repeat: -1,
    });

    // 💨 Jump (frames 10–14)
    scene.anims.create({
      key: `${key}_jump`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 10,
        end: 14,
        suffix: ".aseprite",
      }),
      frameRate: 10,
      repeat: 0,
    });
  }
}
