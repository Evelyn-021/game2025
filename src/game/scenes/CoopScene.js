import { Scene } from "phaser";
import Player from "../../classes/player.js";
import Enemy from "../../classes/Enemy.js";
import Recolectables from "../../classes/recolectables.js";
import { GameState } from "../state/GameState.js";
import { events } from "../../classes/GameEvents.js";
import AudioManager from "../../systems/AudioManager.js";
import DamageSystem from "../../systems/DamageSystem.js";
import { ServiceLocator } from "../../systems/ServiceLocator.js";
import Factory from "../../systems/Factory.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class CoopScene extends Scene {
  constructor() {
    super("CoopScene");
  }

  create() {
    console.log("🎮 Iniciando MODO COOPERATIVO");
    
    // === SISTEMA DE ENTRADA ===
    this.setupInputSystem();
    
    // === SISTEMAS GLOBALES ===
    this.setupGlobalSystems();
    
    // === CONFIGURACIÓN DEL MUNDO ===
    this.setupWorld();
    
    // === JUGADORES ===
    this.setupPlayers();
    
    // === ENEMIGOS CON SISTEMA DE VIDA ===
    this.setupEnemies();
    
    // === SISTEMA DE ATAQUE ===
    this.setupAttackSystem();
    
    // === RECOLECTABLES (usando tu clase existente) ===
    this.setupCollectibles();
    
    // === HUD ===
    this.setupHUD();
    
    // === EVENTOS ===
    this.setupEvents();
  }

  setupInputSystem() {
    this.inputSystem = new InputSystem(this.input);

    // J1 - WASD + SPACE (salto) + E (acción/recolectar) + Q (ataque)
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]:  [Phaser.Input.Keyboard.KeyCodes.A],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
      [INPUT_ACTIONS.UP]:    [Phaser.Input.Keyboard.KeyCodes.W],
      [INPUT_ACTIONS.DOWN]:  [Phaser.Input.Keyboard.KeyCodes.S],
      [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      [INPUT_ACTIONS.EAST]:  [Phaser.Input.Keyboard.KeyCodes.E],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.Q], // ATAQUE COOP
    }, "player1");

    // J2 - Flechas + 0 numpad (salto) + ENTER (acción) + M (ataque)
    this.inputSystem.configureKeyboard({
      [INPUT_ACTIONS.LEFT]:  [Phaser.Input.Keyboard.KeyCodes.LEFT],
      [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
      [INPUT_ACTIONS.UP]:    [Phaser.Input.Keyboard.KeyCodes.UP],
      [INPUT_ACTIONS.DOWN]:  [Phaser.Input.Keyboard.KeyCodes.DOWN],
      [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO],
      [INPUT_ACTIONS.EAST]:  [Phaser.Input.Keyboard.KeyCodes.ENTER],
      [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.M], // ATAQUE COOP
    }, "player2");
  }

  setupGlobalSystems() {
    this.audioManager = new AudioManager(this);
    this.audioManager.add("collect");
    this.audioManager.add("respawn");
    this.audioManager.add("salud");
    this.audioManager.add("attack");
    this.audioManager.add("enemy_hit");
    this.audioManager.add("enemy_death");
    this.audioManager.add("bitemonster");
    this.audioManager.add("daño");

    this.damageSystem = new DamageSystem(this, this.audioManager);

    ServiceLocator.register("audio", this.audioManager);
    ServiceLocator.register("damage", this.damageSystem);
  }

  setupWorld() {
    // === FÍSICAS ===
    this.physics.world.gravity.y = 800;

    // === FONDO SIMPLIFICADO ===
    const { width, height } = this.scale;
    this.add.image(0, 0, "background2").setOrigin(0).setScrollFactor(0).setDisplaySize(width, height);

    // === PLATAFORMAS BÁSICAS ===
    this.platforms = this.physics.add.staticGroup();
    
    // Plataformas principales (puedes ajustar según tu mapa)
    this.platforms.create(400, 500, 'platform').setScale(4, 1).refreshBody();
    this.platforms.create(200, 350, 'platform').setScale(2, 1).refreshBody();
    this.platforms.create(600, 350, 'platform').setScale(2, 1).refreshBody();
    this.platforms.create(400, 200, 'platform').setScale(2, 1).refreshBody();

    // Si no tienes texture 'platform', usa un gráfico temporal
    if (!this.textures.exists('platform')) {
      const platformGraphics = this.add.graphics();
      platformGraphics.fillStyle(0x8B4513, 1);
      platformGraphics.fillRect(0, 0, 200, 20);
      platformGraphics.generateTexture('platform', 200, 20);
      platformGraphics.destroy();
    }
  }

  setupPlayers() {
    // Spawn points
    this.player1 = new Player(this, 300, 300, GameState.player1.character || "Pinky", 1);
    this.player2 = new Player(this, 500, 300, GameState.player2.character || "Lamb", 2);

    // Colisiones con plataformas
    this.physics.add.collider(this.player1, this.platforms);
    this.physics.add.collider(this.player2, this.platforms);

    // Configurar cámaras para seguir a ambos jugadores
    this.cameras.main.setBounds(0, 0, 800, 600);
  }

  setupEnemies() {
    this.enemies = this.add.group();
    
    // Configurar enemigos con sistema de vida (3 golpes)
    this.enemyConfigs = {
      "ooze": { health: 3, speed: 80 },
      "bear": { health: 3, speed: 150 }
    };

    // Crear enemigos iniciales
    this.spawnEnemy("ooze", 200, 250);
    this.spawnEnemy("bear", 400, 150);
    this.spawnEnemy("ooze", 600, 250);

    // Timer para spawn continuo de enemigos
    this.enemySpawnTimer = this.time.addEvent({
      delay: 8000, // Cada 8 segundos
      callback: this.spawnRandomEnemy,
      callbackScope: this,
      loop: true
    });
  }

  spawnEnemy(type, x, y) {
    const config = this.enemyConfigs[type];
    const enemy = new Enemy(this, x, y, type, type, [this.player1, this.player2], this.audioManager);
    
    // Configurar propiedades específicas del modo coop
    enemy.setCoopProperties(config.health, config.speed);
    this.enemies.add(enemy);
    
    // Colisión con plataformas
    this.physics.add.collider(enemy, this.platforms);
    
    console.log(`🎯 Enemigo ${type} creado - HP: ${config.health}, Coop: ${enemy.isCoopEnemy}`);
    
    return enemy;
  }

  spawnRandomEnemy() {
    if (this.enemies.getLength() >= 8) return; // Límite de enemigos
    
    const types = Object.keys(this.enemyConfigs);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const x = Phaser.Math.Between(100, 700);
    const y = 100;
    
    this.spawnEnemy(randomType, x, y);
  }

  setupAttackSystem() {
    // Grupos para áreas de ataque de jugadores
    this.player1Attacks = this.physics.add.group();
    this.player2Attacks = this.physics.add.group();

    // Colisiones entre ataques y enemigos - CORREGIDO
    this.physics.add.overlap(this.player1Attacks, this.enemies, (attackZone, enemy) => {
      this.handlePlayerAttack(attackZone, enemy, 1);
    }, null, this);

    this.physics.add.overlap(this.player2Attacks, this.enemies, (attackZone, enemy) => {
      this.handlePlayerAttack(attackZone, enemy, 2);
    }, null, this);
  }

  setupCollectibles() {
    // Usar tu sistema existente de recolectables
    const objetosMapa = [
      { name: "donas", x: 300, y: 200 },
      { name: "donas", x: 500, y: 200 },
      { name: "donas", x: 400, y: 100 }
    ];
    
    this.recolectables = new Recolectables(this, objetosMapa);
    this.recolectables.addColliders([this.player1, this.player2], []);
  }

  setupHUD() {
    // Texto del modo
    this.add.text(this.scale.width / 2, 30, "MODO COOPERATIVO", {
      fontFamily: "Arial Black",
      fontSize: 32,
      color: "#66ff66",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0);

    // Contadores
    this.enemyCountText = this.add.text(20, 20, "Enemigos Derrotados: 0", {
      fontSize: 18,
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    this.enemiesDefeated = 0;
  }

  setupEvents() {
    // Evento cuando un enemigo es derrotado
    events.on("enemy-defeated", this.onEnemyDefeated, this);

    // Limpiar servicios al salir
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      ServiceLocator.clear();
      events.off("enemy-defeated", this.onEnemyDefeated, this);
      this.enemySpawnTimer?.remove();
    });
  }

  // === MÉTODOS DE ATAQUE COOPERATIVO - CORREGIDOS ===
  playerAttack(player, playerId) {
    if (!player.canAttack()) return;

    const attackStarted = player.attack();
    if (!attackStarted) return;

    this.audioManager.play("attack", { volume: 0.4 });

    // Crear área de ataque temporal - CORREGIDO
    const attackRange = 60;
    const direction = player.flipX ? -1 : 1;
    const attackX = player.x + (attackRange * direction);
    
    // Crear zona de colisión correctamente
    const attackZone = this.add.zone(attackX, player.y, attackRange * 2, 80);
    this.physics.add.existing(attackZone);
    attackZone.body.setAllowGravity(false);
    
    // Grupo de ataques según jugador
    const attackGroup = playerId === 1 ? this.player1Attacks : this.player2Attacks;
    attackGroup.add(attackZone);

    console.log(`⚔️ Jugador ${playerId} atacando en (${Math.round(attackX)}, ${Math.round(player.y)})`);

    // Efecto visual de ataque
    const attackEffect = this.add.rectangle(attackX, player.y, attackRange * 2, 80, 0xff0000, 0.3);
    attackEffect.setOrigin(0.5);
    
    // Remover después de un tiempo corto
    this.time.delayedCall(300, () => {
      if (attackZone.active) {
        attackGroup.remove(attackZone);
        attackZone.destroy();
      }
      if (attackEffect.active) {
        attackEffect.destroy();
      }
    });
  }

  handlePlayerAttack(attackZone, enemy, playerId) {
    if (!enemy.active || !attackZone.active) {
      return;
    }

    console.log(`🎯 Colisión: Jugador ${playerId} vs ${enemy.tipo}`);

    // Aplicar daño al enemigo (1 punto por ataque)
    const died = enemy.takeDamage(1);
    
    if (died) {
      console.log(`💀 ${enemy.tipo} murió!`);
      this.audioManager.play("enemy_death", { volume: 0.6 });
      this.enemiesDefeated++;
      this.enemyCountText.setText(`Enemigos Derrotados: ${this.enemiesDefeated}`);
      
      // Evento para notificar la derrota
      events.emit("enemy-defeated", { enemy: enemy, type: enemy.tipo });
    } else {
      console.log(`💥 ${enemy.tipo} recibió daño. HP: ${enemy.hp}`);
      this.audioManager.play("enemy_hit", { volume: 0.4 });
    }

    // Remover la zona de ataque después del golpe
    const attackGroup = playerId === 1 ? this.player1Attacks : this.player2Attacks;
    if (attackZone.active) {
      attackGroup.remove(attackZone);
      attackZone.destroy();
    }
  }

  onEnemyDefeated(data) {
    console.log(`🎯 Enemigo ${data.type} derrotado! Total: ${this.enemiesDefeated}`);
    
    // Respawn automático después de 3 segundos
    this.time.delayedCall(3000, () => {
      if (this.scene && this.enemies) {
        this.spawnRandomEnemy();
      }
    });
  }

  update() {
    // === MOVIMIENTO JUGADORES ===
    this.updatePlayerInput(this.player1, "player1");
    this.updatePlayerInput(this.player2, "player2");

    // === ACTUALIZAR JUGADORES ===
    this.player1.update();
    this.player2.update();

    // === ACTUALIZAR ENEMIGOS ===
    this.enemies.children.iterate((enemy) => {
      if (enemy) enemy.update();
    });

    // === ACTUALIZAR CÁMARA (seguir a ambos jugadores) ===
    this.updateCamera();
  }

  updatePlayerInput(player, playerKey) {
    const input = this.inputSystem;

    // Movimiento horizontal
    if (input.isPressed(INPUT_ACTIONS.LEFT, playerKey)) {
      player.moveLeft();
    } else if (input.isPressed(INPUT_ACTIONS.RIGHT, playerKey)) {
      player.moveRight();
    } else {
      player.stopMoving();
    }

    // Salto
    if (input.isJustPressed(INPUT_ACTIONS.NORTH, playerKey)) {
      player.jump();
    }

    // Recolectar (usando tu sistema existente)
    if (input.isJustPressed(INPUT_ACTIONS.EAST, playerKey)) {
      player.collect();
    }

    // ATAQUE COOPERATIVO (nueva funcionalidad)
    if (input.isJustPressed(INPUT_ACTIONS.SOUTH, playerKey)) {
      this.playerAttack(player, player.id);
    }
  }

  updateCamera() {
    const cam = this.cameras.main;
    
    // Centrar cámara entre ambos jugadores
    const centerX = (this.player1.x + this.player2.x) / 2;
    const centerY = (this.player1.y + this.player2.y) / 2;
    
    // Smooth follow
    cam.scrollX = Phaser.Math.Linear(cam.scrollX, centerX - cam.width / 2, 0.1);
    cam.scrollY = Phaser.Math.Linear(cam.scrollY, centerY - cam.height / 2, 0.1);

    // Zoom dinámico basado en distancia entre jugadores
    const distance = Phaser.Math.Distance.Between(this.player1.x, this.player1.y, this.player2.x, this.player2.y);
    const targetZoom = Phaser.Math.Clamp(1.2 - distance / 800, 0.9, 1.3);
    cam.zoom = Phaser.Math.Linear(cam.zoom, targetZoom, 0.05);
  }
}