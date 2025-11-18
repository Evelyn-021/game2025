import { Scene } from "phaser";
import Player from "../../classes/player.js";
import { GameState } from "../state/GameState.js";
import { events } from "../../classes/GameEvents.js";
import AudioManager from "../../systems/AudioManager.js";
import DamageSystem from "../../systems/DamageSystem.js";
import { ServiceLocator } from "../../systems/ServiceLocator.js";
import Factory from "../../systems/Factory.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  create() {
    // =====================================================
    // SISTEMA DE ENTRADA GLOBAL
    // =====================================================
    this.inputSystem = new InputSystem(this.input);

    // --- Player 1 ---
    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
        [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
        [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.E],
        [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.Q],
      },
      "player1"
    );

    // --- Player 2 ---
    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
        [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO],
        [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.ENTER],
        [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.M],
      },
      "player2"
    );

    // =====================================================
    // SISTEMAS GLOBALES
    // =====================================================
    this.audioManager = new AudioManager(this);
    this.audioManager.add("collect");
    this.audioManager.add("respawn");
    this.audioManager.add("salud");
    this.audioManager.add("bitemonster");
    this.audioManager.add("daño");

    this.damageSystem = new DamageSystem(this, this.audioManager);

    ServiceLocator.register("audio", this.audioManager);
    ServiceLocator.register("damage", this.damageSystem);

    // =====================================================
    // CREAR MUNDO: MAPA + PARALLAX + CAJAS
    // =====================================================
    this.setupWorld();

    // =====================================================
    // CONFIGURACIÓN DE FÍSICA
    // =====================================================
    this.physics.world.gravity.y = 800;
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, true, true, true, false);

    // =====================================================
    // CREAR JUGADORES
    // =====================================================
    const char1 = GameState.player1.character || "Pinky";
    const char2 = GameState.player2.character || "Lamb";

    console.log('🔍 GameState - J1:', GameState.player1.character, 'J2:', GameState.player2.character);

    this.player1 = new Player(this, this.spawn1.x, this.spawn1.y, char1, 1);
    this.player2 = new Player(this, this.spawn2.x, this.spawn2.y, char2, 2);

    // Configurar físicas de jugadores
    this.player1.body.setGravityY(800);
    this.player2.body.setGravityY(800);
    this.player1.body.setCollideWorldBounds(true);
    this.player2.body.setCollideWorldBounds(true);

    // =====================================================
    // COLISIONES
    // =====================================================
    this.physics.add.collider(this.player1, this.plataformas);
    this.physics.add.collider(this.player2, this.plataformas);

    // =====================================================
    // RECOLECTABLES
    // =====================================================
    const players = [this.player1, this.player2];
    const boxes = GameState.mode === "versus" ? [this.caja1, this.caja2] : [this.cajaCoop];

    this.recolectables = Factory.createRecolectables(
      this,
      this.objetosMapa,
      players,
      boxes
    );

    // =====================================================
    // ENEMIGOS
    // =====================================================
    const enemyObjects = this.map.getObjectLayer("enemigos")?.objects || [];
    this.enemies = Factory.createEnemies(this, enemyObjects, [this.player1, this.player2], this.audioManager);

    // Colisiones de enemigos con plataformas
    this.enemies.forEach(e => {
      this.physics.add.collider(e, this.plataformas);
    });

    // =====================================================
    // SISTEMA DE DAÑO - ENEMIGOS A JUGADORES
    // =====================================================
    this.enemies.forEach(enemy => {
      this.physics.add.overlap(this.player1, enemy, () => {
        this.handleEnemyCollision(this.player1, enemy);
      });
      
      this.physics.add.overlap(this.player2, enemy, () => {
        this.handleEnemyCollision(this.player2, enemy);
      });
    });

    // =====================================================
    // ESCUCHAR EVENTOS
    // =====================================================
    events.on("player-dead", ({ player, playerID }) => {
      console.log(`📢 Evento player-dead recibido: Jugador ${playerID}`);
      this.handlePlayerDeath(player, playerID);
    });

    events.on("dona-recolectada", (playerId) => {
      if (playerId === 1) GameState.player1.donasRecolectadas++;
      if (playerId === 2) GameState.player2.donasRecolectadas++;
    });

    // =====================================================
    // HUD
    // =====================================================
    this.scene.launch("HUDScene");

    // =====================================================
    // LÓGICA DE ESCALERAS - CORREGIDA
    // =====================================================
    this.addClimbLogic(this.player1, "player1");
    this.addClimbLogic(this.player2, "player2");

    // =====================================================
    // MODO DE JUEGO
    // =====================================================
    if (GameState.mode === "versus") this.initVersus();
    if (GameState.mode === "coop") this.initCoop();

    // =====================================================
    // FIN DE TIEMPO
    // =====================================================
    events.on("time-up", () => {
      const p1 = GameState.player1.donasRecolectadas || 0;
      const p2 = GameState.player2.donasRecolectadas || 0;
      const tiempo = this.scene.get("HUDScene")?.timeLeft ?? 0;
      this.scene.stop("HUDScene");
      
      if (p1 === p2) {
        this.scene.start("EmpateScene", { p1, p2, tiempo });
      } else {
        const winner = p1 > p2 ? "Jugador 1" : "Jugador 2";
        this.scene.start("VictoryScene", { winner, p1, p2, tiempo });
      }
    });

    // =====================================================
    // LIMPIEZA
    // =====================================================
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      ServiceLocator.clear();
      events.off("player-dead");
      events.off("time-up");
    });
  }

  // ============================================================
  //  WORLD — MAPA + PARALLAX + CAJAS
  // ============================================================
  setupWorld() {
    const mode = GameState.mode;
    const { width, height } = this.scale;

    // ===== MAPA =====
    const mapConfig = mode === "coop" 
      ? {
          sueloKey: "suelo2",
          sueloImg: "wip5", 
          escaleraKey: "escalera2",
          escaleraImg: "escalera"
        }
      : {
          sueloKey: "suelo",
          sueloImg: "tiles",
          escaleraKey: "escalera", 
          escaleraImg: "escalera"
        };

    const { map, plataformas, escaleras, fondo } = Factory.createMap(
      this,
      mode === "coop" ? "map2" : "map",
      mapConfig
    );

    this.map = map;
    this.plataformas = plataformas;
    this.escaleras = escaleras;
    this.fondoLayer = fondo;

    // ===== OBJETOS =====
    this.objetosMapa = map.getObjectLayer("objetos")?.objects || [];
    this.spawn1 = this.objetosMapa.find((o) => o.name === "player") || { x: 200, y: 200 };
    this.spawn2 = this.objetosMapa.find((o) => o.name === "player2") || { x: 500, y: 200 };

    // ===== PARALLAX =====
    const { layers, stars } = Factory.createParallax(this, mode, width, height);
    this.bgLayers = layers;
    this.bgStars = stars;

    // ===== CAJAS =====
    if (mode === "versus") {
      [this.caja1, this.caja2] = Factory.createBoxes(this);
    } else {
      this.cajaCoop = Factory.createSharedBox(this, this.spawn1);
    }

    // ===== CÁMARA =====
    const cam = this.cameras.main;
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Deadzone para mejor seguimiento
    cam.setDeadzone(
      this.scale.width * 0.45,
      this.scale.height * 0.40
    );
  }

  // =============================================================
  // MODO VERSUS
  // =============================================================
  initVersus() {
    GameState.player1.donasRecolectadas = 0;
    GameState.player2.donasRecolectadas = 0;

    this.add.text(this.scale.width / 2, 40, "MODO VERSUS", {
      fontFamily: "Arial Black",
      fontSize: 32,
      color: "#ff66cc",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    this.physics.add.collider(this.player1, this.player2, () => {
      const diff = this.player1.x - this.player2.x;
      if (diff > 0) {
        this.player1.x += 5;
        this.player2.x -= 5;
      } else {
        this.player1.x -= 5;
        this.player2.x += 5;
      }
    });

    const hud = this.scene.get("HUDScene");
    if (hud) hud.events.once("time-up", () => events.emit("time-up"));
  }

  // =============================================================
  // MODO COOP
  // =============================================================
  initCoop() {
    this.add.text(this.scale.width / 2, 40, "MODO COOPERATIVO", {
      fontFamily: "Arial Black",
      fontSize: 32,
      color: "#66ff66",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
  }

 // =============================================================
// LÓGICA DE ESCALERAS - MÉTODO ORIGINAL FUNCIONANDO
// =============================================================
addClimbLogic(player, playerKey) {
  player.isClimbing = false;

  // ✅ CONVERTIR el TilemapLayer a array de tiles
  let escalerasTiles = [];
  this.escaleras.forEachTile(tile => {
    if (tile && tile.index !== -1) {
      escalerasTiles.push(tile);
    }
  });

  this.events.on("update", () => {
    if (!player || !player.body || !player.active) return;

    // ✅ AHORA SÍ funciona porque escalerasTiles es un array
    const onLadder = escalerasTiles.some(tile =>
      Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), tile.getBounds())
    );

    if (onLadder) {
      player.isClimbing = true;
      player.body.allowGravity = false;
      player.setVelocityY(0);

      const input = this.inputSystem;
      if (input.isPressed(INPUT_ACTIONS.UP, playerKey)) {
        player.y -= 4; // Un poco más rápido
      } else if (input.isPressed(INPUT_ACTIONS.DOWN, playerKey)) {
        player.y += 4;
      }

    } else if (player.isClimbing) {
      player.isClimbing = false;
      player.body.allowGravity = true;
    }
  });
}
  // =============================================================
  // COLISIÓN CON ENEMIGOS - SISTEMA DE DAÑO
  // =============================================================
  handleEnemyCollision(player, enemy) {
    if (player.invulnerable || !player.active) return;

    // Aplicar daño al jugador
    ServiceLocator.get("damage").applyDamage(player, player.id);
    
    // Efecto de knockback
    const knockbackDirection = player.x < enemy.x ? -1 : 1;
    player.setVelocityX(200 * knockbackDirection);
    player.setVelocityY(-200);

    // Efecto visual de daño
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });

    // Hacer al jugador invulnerable temporalmente
    player.invulnerable = true;
    this.time.delayedCall(1000, () => {
      player.invulnerable = false;
    });
  }

  // =============================================================
  // HANDLER DE MUERTE
  // =============================================================
  handlePlayerDeath(player, id) {
    player.setActive(false).setVisible(false);
    player.body.enable = false;

    const p1 = GameState.player1.donasRecolectadas || 0;
    const p2 = GameState.player2.donasRecolectadas || 0;
    const tiempo = this.scene.get("HUDScene")?.timeLeft ?? 0;
    const winner = id === 1 ? "Jugador 2" : "Jugador 1";

    this.scene.stop("HUDScene");

    this.time.delayedCall(800, () => {
      this.scene.start("GameOver", {
        winner,
        p1,
        p2,
        tiempo,
        motivo: "sin vidas",
      });
    });
  }

  // =============================================================
  // LOOP DE UPDATE
  // =============================================================
  update() {
    // MOVIMIENTO J1 - Solo horizontal si no está escalando
    if (!this.player1.isClimbing) {
      if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT, "player1")) this.player1.moveLeft();
      else if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, "player1")) this.player1.moveRight();
      else this.player1.stopMoving();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH, "player1"))
      this.player1.jump();

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1"))
      this.player1.collect();

    if (GameState.mode === "coop" && this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player1"))
      this.player1.attack();

    // MOVIMIENTO J2 - Solo horizontal si no está escalando
    if (!this.player2.isClimbing) {
      if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT, "player2")) this.player2.moveLeft();
      else if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, "player2")) this.player2.moveRight();
      else this.player2.stopMoving();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH, "player2"))
      this.player2.jump();

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2"))
      this.player2.collect();

    if (GameState.mode === "coop" && this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player2"))
      this.player2.attack();

    // Asegurar que la gravedad se restablezca si no están escalando
    if (!this.player1.isClimbing && !this.player1.body.allowGravity) {
      this.player1.body.allowGravity = true;
    }
    if (!this.player2.isClimbing && !this.player2.body.allowGravity) {
      this.player2.body.allowGravity = true;
    }

    // UPDATE DE PERSONAJES
    this.player1.update();
    this.player2.update();

    // UPDATE ENEMIGOS
    this.enemies.forEach(e => e.update?.());

    // CÁMARA DINÁMICA
    const cam = this.cameras.main;
    const cx = (this.player1.x + this.player2.x) / 2;
    const cy = (this.player1.y + this.player2.y) / 2;
    const lerp = 0.08;

    cam.scrollX += (cx - cam.midPoint.x) * lerp;
    cam.scrollY += (cy - cam.midPoint.y) * lerp;

    // ZOOM DINÁMICO
    const distX = Math.abs(this.player1.x - this.player2.x);
    const distY = Math.abs(this.player1.y - this.player2.y);
    const dist = Math.max(distX, distY);

    const targetZoom = Phaser.Math.Clamp(1.2 - dist / 1200, 0.85, 1.2);
    cam.zoom = Phaser.Math.Linear(cam.zoom, targetZoom, 0.05);

    // PARALLAX
    const vw = this.scale.width / cam.zoom;
    const vh = this.scale.height / cam.zoom;

    const ox = cam.midPoint.x;
    const oy = cam.midPoint.y;

    this.bgLayers.forEach(layer => {
      layer.x = ox;
      layer.y = oy;
      layer.displayWidth = vw * 1.4;
      layer.displayHeight = vh * 1.4;
    });

    this.bgStars.x = ox;
    this.bgStars.y = oy;
    this.bgStars.displayWidth = vw * 1.6;
    this.bgStars.displayHeight = vh * 1.6;
    this.bgStars.tilePositionX += 0.4;

    // CAÍDA DEL MUNDO
    const worldH = this.physics.world.bounds.height;
    if (!this.player1.invulnerable && this.player1.y > worldH + 100)
      this.playerDied(this.player1, 1);
    if (!this.player2.invulnerable && this.player2.y > worldH + 100)
      this.playerDied(this.player2, 2);
  }

  // =============================================================
  // MUERTE Y RESPAWN - CORREGIDO (problema de caída)
  // =============================================================
  playerDied(player, id) {
    const key = id === 1 ? "player1" : "player2";
    const st = GameState[key];
    if (!player.active || player.invulnerable) return;

    console.log(`💀 playerDied - Jugador ${id}:`);

    if (st.lives > 1) {
      st.lives--;
      events.emit("update-life", { playerID: id, vidas: st.lives });

      player.invulnerable = true;
      player.body.allowGravity = false;
      player.body.setVelocity(0, 0);
      player.body.checkCollision.none = true;

      const spawn = id === 1 ? this.spawn1 : this.spawn2;
      const safeY = Math.max(50, spawn.y - 20); // ✅ CORREGIDO: Posición segura

      player.setPosition(spawn.x, safeY);
      player.setActive(true).setVisible(true);

      this.audioManager.play("respawn", { volume: 0.5, rate: 1.1 });

      this.tweens.add({
        targets: player,
        alpha: 0.3,
        scaleX: 1.1,
        scaleY: 0.9,
        duration: 150,
        yoyo: true,
        repeat: 4,
        ease: "Sine.easeInOut",
        onComplete: () => { 
          player.alpha = 1; 
          player.setScale(1);
        },
      });

      this.time.delayedCall(1000, () => {
        // ✅ CORREGIDO: Restablecer física correctamente
        player.body.allowGravity = true;
        player.body.checkCollision.none = false;
        player.invulnerable = false;
        player.body.enable = true;
        
        // ✅ CORREGIDO: Asegurar que esté sobre plataforma
        player.body.setVelocity(0, 0);
      });
      return;
    }

    st.lives = 0;
    this.handlePlayerDeath(player, id);
  }
}