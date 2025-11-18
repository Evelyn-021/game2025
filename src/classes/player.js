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

    // === ATAQUE COOP ===
    this.isAttacking = false;
    this.attackCooldown = 500;
    this.lastAttackTime = 0;
    this.currentAttackType = "attack1";

    // === HITBOX DE ATAQUE ===
    this.attackRange = 40;       // distancia para golpear
    this.attackWidth = 60;       // ancho del golpe
    this.facingRight = true;     // dirección actual

    // === ANIMACIONES ===
    this.createAnimations(scene);
    this.play(`${this.textureName}_idle`, true);
  }


  // =======================================================
  // 🔥 ATAQUE COMPLETO: ANIMACIÓN + EVENTO + HITBOX
  // =======================================================
  attack() {
    const now = this.scene.time.now;

    if (this.isAttacking || now - this.lastAttackTime < this.attackCooldown)
      return false;

    this.isAttacking = true;
    this.lastAttackTime = now;

    // --- alternancia de ataques ---
    this.currentAttackType =
      this.currentAttackType === "attack1" ? "attack2" : "attack1";

    const anim = `${this.textureName}_${this.currentAttackType}`;

    // 🔥 DIRECCIÓN DEL ATAQUE
    this.facingRight = !this.flipX;

    // 🔥 EMITIR ATAQUE HACIA ENEMIGOS
    events.emit("player-attack", {
      player: this,
      x: this.x,
      y: this.y,
      range: this.attackRange,
      width: this.attackWidth,
      direction: this.facingRight ? 1 : -1,
      id: this.id,
    });

    // --- reproducir animación ---
    if (this.scene.anims.exists(anim)) {
      this.play(anim, true);

      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isAttacking = false;
        if (this.body && this.body.onFloor()) {
          this.play(`${this.textureName}_idle`, true);
        }
      });
    } else {
      console.warn(`❌ Animación de ataque no encontrada: ${anim}`);
      this.scene.time.delayedCall(300, () => (this.isAttacking = false));
    }

    return true;
  }


  // === MÉTODO NUEVO PARA VERIFICAR SI PUEDE ATACAR ===
  canAttack() {
    const now = this.scene.time.now;
    return !this.isAttacking && 
           (now - this.lastAttackTime >= this.attackCooldown) &&
           this.body && 
           this.body.onFloor();
  }

  // === MÉTODO NUEVO PARA CONFIGURAR ESTADO DE ATAQUE (usado desde CoopScene) ===
  setAttacking(attacking) {
    this.isAttacking = attacking;
  }

  // === MÉTODOS DE MOVIMIENTO EXISTENTES (con pequeña modificación) ===
  moveLeft() {
    if (this.isAttacking) return; // No moverse mientras ataca
    
    this.setVelocityX(-this.speed);
    this.flipX = true;
    if (this.body && this.body.onFloor() && !this.isAttacking) {
      this.play(`${this.textureName}_walk`, true);
    }
  }

  moveRight() {
    if (this.isAttacking) return; // No moverse mientras ataca
    
    this.setVelocityX(this.speed);
    this.flipX = false;
    if (this.body && this.body.onFloor() && !this.isAttacking) {
      this.play(`${this.textureName}_walk`, true);
    }
  }

  stopMoving() {
    this.setVelocityX(0);
    if (this.body && this.body.onFloor() && !this.isAttacking) {
      this.play(`${this.textureName}_idle`, true);
    }
  }

  jump() {
    if (this.body && this.body.blocked && this.body.blocked.down && !this.isAttacking) {
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
    if (!this.canMove) {
      this.stopMoving();
      return;
    }

    // Si está atacando, no permitir movimiento
    if (this.isAttacking) {
      this.setVelocityX(0);
      return;
    }

    //Movimiento
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

  // === CREACIÓN DE ANIMACIONES (CORREGIDO CON ANIMACIONES DE ATAQUE) ===
  createAnimations(scene) {
    const key = this.textureName;

    // Animación idle (0-3)
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

    // Animación walk (4-9)
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

    // Animación jump (10-14/15 dependiendo del personaje)
    if (!scene.anims.exists(`${key}_jump`)) {
      // Para Lamb: 10-15, para Pinky: 10-14
      const jumpEnd = key === 'Lamb' ? 15 : 14;
      scene.anims.create({
        key: `${key}_jump`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${key} `,
          start: 10,
          end: jumpEnd,
          suffix: ".aseprite",
        }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // === ANIMACIONES DE ATAQUE (USANDO LOS FRAMES CORRECTOS) ===
    
    // Attack1 - Lamb: 33-38, Pinky: 32-37
    if (!scene.anims.exists(`${key}_attack1`)) {
      const attack1Start = key === 'Lamb' ? 33 : 32;
      const attack1End = key === 'Lamb' ? 38 : 37;
      
      scene.anims.create({
        key: `${key}_attack1`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${key} `,
          start: attack1Start,
          end: attack1End,
          suffix: ".aseprite",
        }),
        frameRate: 12,
        repeat: 0,
      });
      console.log(`✅ Animación attack1 creada para ${key} (frames ${attack1Start}-${attack1End})`);
    }

    // Attack2 - Lamb: 39-43, Pinky: 38-43  
    if (!scene.anims.exists(`${key}_attack2`)) {
      const attack2Start = key === 'Lamb' ? 39 : 38;
      const attack2End = 43; // Ambos terminan en 43
      
      scene.anims.create({
        key: `${key}_attack2`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${key} `,
          start: attack2Start,
          end: attack2End,
          suffix: ".aseprite",
        }),
        frameRate: 12,
        repeat: 0,
      });
      console.log(`✅ Animación attack2 creada para ${key} (frames ${attack2Start}-${attack2End})`);
    }

    // Animación hurt (opcional, para cuando reciben daño)
    if (!scene.anims.exists(`${key}_hurt`)) {
      const hurtStart = key === 'Lamb' ? 16 : 15;
      const hurtEnd = key === 'Lamb' ? 19 : 18;
      
      scene.anims.create({
        key: `${key}_hurt`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${key} `,
          start: hurtStart,
          end: hurtEnd,
          suffix: ".aseprite",
        }),
        frameRate: 8,
        repeat: 0,
      });
    }

    // Animación collect (opcional)
    if (!scene.anims.exists(`${key}_collect`)) {
      const collectStart = key === 'Lamb' ? 27 : 26;
      const collectEnd = key === 'Lamb' ? 32 : 31;
      
      scene.anims.create({
        key: `${key}_collect`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${key} `,
          start: collectStart,
          end: collectEnd,
          suffix: ".aseprite",
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
  }
}