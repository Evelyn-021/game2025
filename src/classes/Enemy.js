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

    // === PROPIEDADES NUEVAS PARA MODO COOP ===
    this.isCoopEnemy = false;
    this.coopHealth = 3;
    this.coopSpeed = 45;
    this.isTakingDamage = false; // Nuevo estado para daño

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

  // === MÉTODO NUEVO PARA CONFIGURAR PROPIEDADES COOP ===
  setCoopProperties(health = 3, speed = 45) {
    this.isCoopEnemy = true;
    this.coopHealth = health;
    this.coopSpeed = speed;
    this.hp = this.coopHealth;
    
    if (speed !== this.speed) {
      this.speed = speed;
    }
    
    console.log(`✅ ${this.tipo} configurado para coop - HP: ${this.hp}, Velocidad: ${this.coopSpeed}`);
  }

  // === MÉTODO NUEVO PARA RECIBIR DAÑO EN MODO COOP ===
  takeDamage(amount = 1) {
    // Solo funciona para enemigos coop
    if (!this.isCoopEnemy) {
      console.log("❌ Este enemigo no está configurado para modo coop");
      return false;
    }
    
    if (this.isTakingDamage) {
      return false;
    }
    
    console.log(`🎯 ${this.tipo} recibió daño. HP antes: ${this.hp}`);
    
    this.hp -= amount;
    this.isTakingDamage = true;
    
    console.log(`💥 ${this.tipo} HP después: ${this.hp}`);

    // ✅ ANIMACIÓN DE DAÑO
    const hurtAnim = `${this.tipo}_hurt`;
    if (this.scene.anims.exists(hurtAnim)) {
      console.log(`🎬 Reproduciendo animación: ${hurtAnim}`);
      this.play(hurtAnim, true);
      
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isTakingDamage = false;
        if (this.active && this.hp > 0) {
          this.play(`${this.tipo}_idle`, true);
        }
      });
    } else {
      console.log(`⚠️ No se encontró animación: ${hurtAnim}, usando tint`);
      this.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => {
        if (this.active) {
          this.clearTint();
          this.isTakingDamage = false;
        }
      });
    }

    // Verificar si murió
    if (this.hp <= 0) {
      console.log(`💀 ${this.tipo} murió! Llamando a die()`);
      this.die();
      return true;
    }
    
    return false;
  }

  // === MÉTODO NUEVO PARA MORIR EN MODO COOP ===
  die() {
    // ✅ ANIMACIÓN DE MUERTE si existe
    const deathAnim = `${this.tipo}_death`;
    if (this.scene.anims.exists(deathAnim)) {
      this.play(deathAnim, true);
      
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.hideForRespawn();
      });
    } else {
      // Si no hay animación de muerte, ocultar inmediatamente
      this.hideForRespawn();
    }

    // Reproducir sonido de muerte si está disponible
    if (this.audioManager) {
      this.audioManager.play("enemy_death", { volume: 0.6 });
    }
  }

  // === MÉTODO AUXILIAR PARA OCULTAR ENEMIGO ===
  hideForRespawn() {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.isAttacking = false;
    this.isTakingDamage = false;

    // Respawn automático después de 3 segundos
    this.scene.time.delayedCall(3000, () => {
      if (this.scene && this.active === false) {
        this.respawn();
      }
    });
  }

  // === MÉTODO NUEVO PARA RESPAWNEAR ===
  respawn() {
    if (!this.scene) return;
    
    // Posición aleatoria para respawn
    const spawnX = Phaser.Math.Between(100, 700);
    const spawnY = 100;
    
    this.setPosition(spawnX, spawnY);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;
    this.hp = this.coopHealth;
    this.clearTint();
    this.isAttacking = false;
    this.isTakingDamage = false;
    
    // Reiniciar animación
    this.play(`${this.tipo}_idle`, true);
    
    console.log(`🔄 ${this.tipo} respawneado en (${spawnX}, ${spawnY})`);
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
        if (!enemy.isAttacking && !player.invulnerable && !enemy.isTakingDamage) {
          enemy.attack(player);
        }
      });
    }
  }

  update() {
    // No actualizar si está recibiendo daño o no está activo
    if (!this.active || this.isAttacking || !this.scene || this.isTakingDamage) return;

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
        
        const currentSpeed = this.isCoopEnemy ? this.coopSpeed : this.speed;
        this.setVelocityX(currentSpeed * this.direction);
        
        this.play(`${this.tipo}_walk`, true);
        return;
      }
    }

    // === PATRULLAJE ===
    const currentSpeed = this.isCoopEnemy ? this.coopSpeed : this.speed;
    this.setVelocityX(currentSpeed * this.direction);
    this.play(`${this.tipo}_walk`, true);

    // === DETECCIÓN DE BORDES ===
    const rayLength = 12;
    const rayX = this.x + this.direction * rayLength;
    const rayY = this.y + this.height / 2;

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

    this.scene.time.delayedCall(300, () => {
      if (!player || !this.scene) return;
      
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      const sameHeight = Math.abs(this.y - player.y) < 40;
      
      if (dist < this.attackRange && sameHeight && !player.invulnerable) {
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

    // Animación idle
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

    // Animación walk
    scene.anims.create({
      key: `${key}_walk`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: 4,
        end: key === 'ooze' ? 7 : 9,
        suffix: ".aseprite",
      }),
      frameRate: 8,
      repeat: -1,
    });

    // Animación attack
    scene.anims.create({
      key: `${key}_attack`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: key === 'bear' ? 10 : 8,
        end: key === 'bear' ? 15 : 11,
        suffix: ".aseprite",
      }),
      frameRate: 10,
      repeat: 0,
    });

    // ✅ ANIMACIÓN HURT (daño)
    scene.anims.create({
      key: `${key}_hurt`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: key === 'bear' ? 16 : 12,
        end: key === 'bear' ? 19 : 15,
        suffix: ".aseprite",
      }),
      frameRate: 8,
      repeat: 0,
    });

    // ✅ ANIMACIÓN DEATH (muerte)
    scene.anims.create({
      key: `${key}_death`,
      frames: scene.anims.generateFrameNames(key, {
        prefix: `${key} `,
        start: key === 'bear' ? 20 : 16,
        end: key === 'bear' ? 25 : 19,
        suffix: ".aseprite",
      }),
      frameRate: 8,
      repeat: 0,
    });
  }
}