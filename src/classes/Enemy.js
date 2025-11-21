import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, tipo, jsonKey, playerTargets, audioManager) {
    super(scene, x, y, tipo);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;

     // ⭐ Guardamos posición original para respawn
    this.spawnX = x;
    this.spawnY = y;

    this.tipo = tipo;
    this.playerTargets = Array.isArray(playerTargets) ? playerTargets : [];
    this.audioManager = audioManager;

    // CONFIGURACIÓN BÁSICA
    this.speed = 60;
    this.direction = Phaser.Math.Between(0, 1) ? 1 : -1;
    this.isAttacking = false;
    
    // ✅ SISTEMA DE DETECCIÓN MEJORADO
    this.detectionRange = 80; // Rango más corto para ataque inmediato
    this.attackRange = 60;
    this.attackCooldown = 1500; // 1.5 segundos entre ataques
    this.lastAttackTime = 0;
    
    // ✅ SISTEMA DE VIDA Y DAÑO
    this.hp = 3;
    this.isTakingDamage = false;
    this.isCoopEnemy = false;

    // ✅ POSICIÓN ORIGINAL PARA PATRULLAJE
    this.originalX = x;
    this.patrolRange = 150;

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setBounce(0.1);
    
    // Tamaño del cuerpo para mejor colisión
    this.body.setSize(28, 32);
    this.body.setOffset(2, 0);

    this.createAnimations(scene);
    this.play(`${tipo}_walk`, true);

    // Velocidad inicial
    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction < 0);
  }

  update() {
    if (!this.active || this.isAttacking || this.isTakingDamage) return;

    // ✅ DETECTAR Y ATACAR INMEDIATAMENTE
    const target = this.getAttackTarget();
    if (target) {
      this.startAttack(target);
    } else {
      // Solo patrullar si no hay objetivo de ataque
      this.patrol();
    }
  }

  // ✅ DETECCIÓN INMEDIATA PARA ATAQUE
  getAttackTarget() {
    if (!this.playerTargets || this.playerTargets.length === 0) return null;

    const now = this.scene.time.now;
    if (now - this.lastAttackTime < this.attackCooldown) return null;

    for (const player of this.playerTargets) {
      if (!player || !player.active || player.invulnerable) continue;
      
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      const verticalDist = Math.abs(this.y - player.y);
      
      // ✅ VERIFICAR SI EL JUGADOR ESTÁ EN RANGO DE ATAQUE
      if (dist < this.attackRange && verticalDist < 40) {
        return player;
      }
    }
    return null;
  }

  // ✅ INICIAR ATAQUE INMEDIATAMENTE
  startAttack(player) {
    if (this.isAttacking || !this.scene || !player.active) return;

    this.isAttacking = true;
    this.lastAttackTime = this.scene.time.now;
    
    // ✅ DETENER MOVIMIENTO Y ORIENTARSE AL JUGADOR
    this.setVelocityX(0);
    this.direction = player.x < this.x ? -1 : 1;
    this.setFlipX(this.direction < 0);
    
    // ✅ EJECUTAR ANIMACIÓN DE ATAQUE INMEDIATAMENTE
    this.play(`${this.tipo}_attack`, true);
    
    // ✅ SONIDO DE ATAQUE INMEDIATO
    if (this.audioManager) {
      this.audioManager.play("bitemonster", { volume: 0.5 });
    }

    // ✅ APLICAR DAÑO A MITAD DE LA ANIMACIÓN
    this.scene.time.delayedCall(200, () => {
      if (!player || !player.active || !this.scene) return;
      
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      const verticalDist = Math.abs(this.y - player.y);
      
      // Verificar que el jugador siga en rango durante el ataque
      if (dist < this.attackRange + 10 && verticalDist < 50 && !player.invulnerable) {
        this.scene.events.emit("enemy-attack", player);
      }
    });

    // ✅ VOLVER A PATRULLAR DESPUÉS DEL ATAQUE
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
      if (this.active) {
        this.play(`${this.tipo}_walk`, true);
      }
    });
  }

  // ✅ PATRULLAJE SIMPLE
  patrol() {
    // Cambiar dirección si choca con algo
    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
      this.setVelocityX(this.speed * this.direction);
      this.setFlipX(this.direction < 0);
      return;
    }

    // Cambiar dirección si se aleja demasiado
    if (Math.abs(this.x - this.originalX) > this.patrolRange) {
      this.direction = this.originalX < this.x ? -1 : 1;
      this.setVelocityX(this.speed * this.direction);
      this.setFlipX(this.direction < 0);
      return;
    }

    // ✅ DETECCIÓN DE BORDES
    const rayLength = 40;
    const rayX = this.x + (this.direction * rayLength);
    const rayY = this.y + 20;

    if (this.scene.plataformas) {
      const tileBelow = this.scene.plataformas.getTileAtWorldXY(rayX, rayY + 25);
      
      if (!tileBelow) {
        this.direction *= -1;
        this.setVelocityX(this.speed * this.direction);
        this.setFlipX(this.direction < 0);
      }
    }

    // Movimiento constante
    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction < 0);
    
    // Animación de caminar
    if (this.body.velocity.x !== 0) {
      this.play(`${this.tipo}_walk`, true);
    }
  }




  
// =============================================================
// CHEQUEAR SI EL JUGADOR LO ESTÁ ATACANDO
// =============================================================
checkPlayerHit(player) {
  if (!player || !player.isAttacking || !this.active || this.isTakingDamage) return false;

  // Verificar distancia del ataque
  const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
  if (dist > 50) return false; // rango de ataque del jugador
  
  // Verificar orientación (opcional)
  const facingOK =
    (player.flipX && player.x > this.x) ||
    (!player.flipX && player.x < this.x);

  if (!facingOK) return false;

  // Aplicar daño
  return this.takeDamage(1);
}





  // ✅ SISTEMA DE DAÑO (simplificado)
  takeDamage(amount = 1) {
    if (!this.isCoopEnemy || this.isTakingDamage || !this.active) return false;
    
    this.hp -= amount;
    this.isTakingDamage = true;

    const hurtAnim = `${this.tipo}_hurt`;
    if (this.scene.anims.exists(hurtAnim)) {
      this.play(hurtAnim, true);
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isTakingDamage = false;
        if (this.active && this.hp > 0) this.play(`${this.tipo}_walk`, true);
      });
    } else {
      this.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => {
        if (this.active) {
          this.clearTint();
          this.isTakingDamage = false;
        }
      });
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    
    return false;
  }

  die() {

    // 🔥 DESACTIVAR SOLO EL CUERPO (NO EL SPRITE)
    this.body.enable = false;
    this.setVelocity(0, 0);

    const deathAnim = `${this.tipo}_death`;
    if (this.scene.anims.exists(deathAnim)) {
        this.play(deathAnim, true);

        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.hideForRespawn(); // recién acá apagamos todo
        });

    } else {
        this.hideForRespawn();
    }

    if (this.audioManager) {
        this.audioManager.play("bitemonster", { volume: 0.6 });
    }
}


  hideForRespawn() {
    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.isAttacking = false;
    this.isTakingDamage = false;

    this.scene.time.delayedCall(3000, () => {
      if (this.scene && this.active === false) this.respawn();
    });
  }

  respawn() {
    if (!this.scene) return;

    // ⭐ Volver al EXACTO lugar donde nació
    const spawnX = this.spawnX;
    const spawnY = this.spawnY;

    this.enableBody(true, spawnX, spawnY, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.body.enable = true;

    // restaurar valores
    this.hp = 3;
    this.clearTint();
    this.isAttacking = false;
    this.isTakingDamage = false;

    // dirección aleatoria
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.setFlipX(this.direction < 0);

    this.play(`${this.tipo}_walk`, true);
}


  setCoopProperties(health = 3, speed = 45) {
    this.isCoopEnemy = true;
    this.hp = health;
    this.speed = speed;
  }

  createAnimations(scene) {
    if (!scene) return;
    
    const key = this.texture.key;
    if (scene.anims.exists(`${key}_idle`)) return;

    const animConfigs = {
      idle: { start: 0, end: 3, frameRate: 6, repeat: -1 },
      walk: { start: 4, end: key === 'ooze' ? 7 : 9, frameRate: 8, repeat: -1 },
      attack: { start: key === 'bear' ? 10 : 8, end: key === 'bear' ? 15 : 11, frameRate: 10, repeat: 0 },
      hurt: { start: key === 'bear' ? 16 : 12, end: key === 'bear' ? 19 : 15, frameRate: 8, repeat: 0 },
      death: { start: key === 'bear' ? 20 : 16, end: key === 'bear' ? 25 : 19, frameRate: 8, repeat: 0 }
    };

    Object.entries(animConfigs).forEach(([name, config]) => {
      scene.anims.create({
        key: `${key}_${name}`,
        frames: scene.anims.generateFrameNames(key, {
          prefix: `${key} `,
          start: config.start,
          end: config.end,
          suffix: ".aseprite",
        }),
        frameRate: config.frameRate,
        repeat: config.repeat,
      });
    });
  }
}