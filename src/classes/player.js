import Phaser from "phaser";
import { events } from "./GameEvents.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, id) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.id = id;
    this.textureName = texture;
    this.playerKey = `player${id}`;
    
    console.log(`🎮 Player ${id} creado con texture: ${texture}`);
    
    this.speed = 160;
    this.jumpStrength = -280;
    this.score = 0;
    this.canMove = true;
    this.setCollideWorldBounds(true);

    // === ANIMACIONES ===
    this.createAnimations(scene);
    this.play(`${this.textureName}_idle`, true);
  }

  // === MÉTODOS DE MOVIMIENTO ===
  moveLeft() {
    this.setVelocityX(-this.speed);
    this.flipX = true;
    if (this.body && this.body.onFloor()) {
      this.play(`${this.textureName}_walk`, true);
    }
  }

  moveRight() {
    this.setVelocityX(this.speed);
    this.flipX = false;
    if (this.body && this.body.onFloor()) {
      this.play(`${this.textureName}_walk`, true);
    }
  }

  stopMoving() {
    this.setVelocityX(0);
    if (this.body && this.body.onFloor()) {
      this.play(`${this.textureName}_idle`, true);
    }
  }

  jump() {
    if (this.body && this.body.blocked && this.body.blocked.down) {
      this.setVelocityY(this.jumpStrength);
      this.play(`${this.textureName}_jump`, true);
    }
  }

  collect() {
    this.score++;
    events.emit("update-score", {
      playerID: this.id,
      playerName: this.textureName,
      score: this.score,
    });
  }

  update() {
    // Tu lógica de update existente puede mantenerse
    if (!this.canMove) {
      this.stopMoving();
      return;
    }

    // O eliminar esta parte si el movimiento se controla desde Game.js
    const movingLeft = this.scene.inputSystem?.isPressed?.("left", this.playerKey);
    const movingRight = this.scene.inputSystem?.isPressed?.("right", this.playerKey);

    if (movingLeft) {
      this.moveLeft();
    } else if (movingRight) {
      this.moveRight();
    } else {
      this.stopMoving();
    }

    const jumping = this.scene.inputSystem?.isPressed?.("north", this.playerKey);
    if (jumping && this.body.blocked.down) {
      this.jump();
    }

    const action = this.scene.inputSystem?.isJustPressed?.("east", this.playerKey);
    if (action) {
      this.collect();
    }
  }

  // === CREACIÓN DE ANIMACIONES ===
  createAnimations(scene) {
    const key = this.textureName;

    if (!scene.anims.exists(`${key}_idle`)) {
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
    }

    if (!scene.anims.exists(`${key}_walk`)) {
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
    }

    if (!scene.anims.exists(`${key}_jump`)) {
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
}