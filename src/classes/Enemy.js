import Phaser from "phaser";
import { GameState } from "../game/state/GameState.js";
import { events } from "./GameEvents.js";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, tipo, jsonKey, playerTargets, audioManager) {
    super(scene, x, y, tipo);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // ✅ Guardar referencias PRIMERO
    this.scene = scene;
    this.tipo = tipo;
    this.playerTargets = playerTargets || [];
    this.audioManager = audioManager;

    // === CONFIGURACIÓN ===
    this.speed = 45;
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.isAttacking = false;
    this.hp = 3;
    this.detectionRange = 120;
    this.attackRange = 70;

    this.setOrigin(0.5, 1);
    this.setScale(1.15);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setPushable(false);

    this.createAnimations(scene);
    this.play(`${tipo}_idle`);

    // ✅ Mover collisions al final del constructor
    this.setupCollisions();
  }

  setupCollisions() {
    if (!this.scene || !this.playerTargets) {
      console.warn("Scene or playerTargets not ready for collisions");
      return;
    }

    // ✅ Colisión con plataformas
    if (this.scene.plataformas) {
      this.scene.physics.add.collider(this, this.scene.plataformas);
    }

    // ✅ Colisión física con jugadores
    if (this.playerTargets.length > 0) {
      this.scene.physics.add.collider(this, this.playerTargets);
    }

    // ✅ Detección de daño y ataque (SOLO overlap, NO event listener)
    if (this.playerTargets.length > 0) {
      this.scene.physics.add.overlap(this, this.playerTargets, (enemy, player) => {
        if (!enemy.isAttacking && !player.invulnerable) {
          enemy.attack(player);
        }
      });
    }

  }

  update() {
    if (!this.active || this.isAttacking || !this.scene) return;

    const target = this.detectPlayer();
    if (target) {
      const horizontalDist = Math.abs(target.x - this.x);
      const verticalDist = Math.abs(target.y - this.y);

      // === ATAQUE ===
      if (verticalDist < 40 && horizontalDist < this.attackRange) {
        this.attack(target);
        return;
      }

      // === PERSECUCIÓN ===
      if (verticalDist < 40 && horizontalDist < this.detectionRange) {
        this.direction = target.x < this.x ? -1 : 1;
        this.setFlipX(this.direction < 0);
        this.setVelocityX(this.speed * this.direction);
        this.play(`${this.tipo}_walk`, true);
        return;
      }
    }

    // === PATRULLAJE ===
    this.setVelocityX(this.speed * this.direction);
    this.play(`${this.tipo}_walk`, true);

    // === DETECCIÓN DE BORDES ===
    const rayLength = 12;
    const rayX = this.x + this.direction * rayLength;
    const rayY = this.y + this.height / 2;

    // ✅ Verificar que plataformas existe
    if (this.scene.plataformas) {
      const tileBelow = this.scene.plataformas.getTileAtWorldXY(rayX, rayY + 10);
      const blockedLeft = this.body.blocked.left;
      const blockedRight = this.body.blocked.right;

      if (!tileBelow || blockedLeft || blockedRight) {
        this.direction *= -1;
        this.setFlipX(this.direction < 0);
      }
    }
  }

  detectPlayer() {
    if (!this.playerTargets || this.playerTargets.length === 0) return null;

    let closest = null;
    let minDist = Infinity;

    for (const player of this.playerTargets) {
      if (!player || !player.active) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist < minDist) {
        minDist = dist;
        closest = player;
      }
    }
    return closest;
  }

  attack(player) {
    if (this.isAttacking || !this.scene) return;

    this.isAttacking = true;
    this.setVelocityX(0);
    this.play(`${this.tipo}_attack`, true);
    
    if (this.audioManager) {
      this.audioManager.play("bitemonster", { volume: 0.5 });
    }

    // ✅ Verificar que scene.tweens existe
    this.scene.time.delayedCall(300, () => {
      if (!player || !this.scene) return;
      
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      const sameHeight = Math.abs(this.y - player.y) < 40;
      
      if (dist < this.attackRange && sameHeight && !player.invulnerable) {
        // ✅ Emitir ataque - el Game.js escuchará esto
        this.scene.events.emit("enemy-attack", player);
      }
    });

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
      this.play(`${this.tipo}_idle`, true);
    });
  }

  createAnimations(scene) {
    if (!scene) return;
    
    const key = this.texture.key;
    if (scene.anims.exists(`${key}_idle`)) return;

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

    scene.anims.create({
      key: `${key}_walk`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 4,
        end: 7,
        suffix: ".aseprite",
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: `${key}_attack`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 8,
        end: 11,
        suffix: ".aseprite",
      }),
      frameRate: 10,
      repeat: 0,
    });
  }
}