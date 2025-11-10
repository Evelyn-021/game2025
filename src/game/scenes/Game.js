import { Scene } from "phaser";
import Player from "../../classes/player.js";
import Recolectables from "../../classes/recolectables.js";
import { GameState } from "../state/GameState.js";
import { events } from "../../classes/GameEvents.js";
import AudioManager from "../../systems/AudioManager.js";
import Combo from "../../classes/combo.js"; // 🆕 NUEVO IMPORT
import Enemy from "../../classes/Enemy.js";
export class Game extends Scene {
  constructor() {
    super("Game");
  }

  create() {
    // === AUDIO MANAGER ===
    this.audioManager = new AudioManager(this);
    this.audioManager.add("collect");
    this.audioManager.add("respawn");
    this.audioManager.add("salud"); // 🆕 sonido de curación
  // 🧟‍♂️ Sonidos de enemigos
    this.audioManager.add("bitemonster"); // rugido o mordida
    this.audioManager.add("daño");      // daño al jugador

    // === PARALLAX ANCLADO A CÁMARA ===
    const cam = this.cameras.main;
    const { width, height } = this.scale;

    this.bgSky = this.add.image(0, 0, "background2").setOrigin(0.5).setScrollFactor(0).setDepth(-6);
    this.bgCloudsFar = this.add.image(0, 0, "cake_valley_yellow-clouds").setOrigin(0.5).setScrollFactor(0).setDepth(-5);
    this.bgCloudsMid = this.add.image(0, 0, "cake_valley_cotton-candy-middle").setOrigin(0.5).setScrollFactor(0).setDepth(-4);
    this.bgCloudsFront = this.add.image(0, 0, "cake_valley_cotton-candy-front").setOrigin(0.5).setScrollFactor(0).setDepth(-3);
    this.bgStars = this.add.tileSprite(0, 0, width, height, "cake_valley_sugar-stars").setOrigin(0.5).setScrollFactor(0).setDepth(-2);

    this.bgLayers = [this.bgSky, this.bgCloudsFar, this.bgCloudsMid, this.bgCloudsFront];
    this.bgLayers.forEach(l => {
      l.displayWidth = width * 1.3;
      l.displayHeight = height * 1.3;
    });
    this.bgStars.displayWidth = width * 1.5;
    this.bgStars.displayHeight = height * 1.5;

    // === TILEMAP ===
    const map = this.make.tilemap({ key: "map" });
    const sueloSet = map.addTilesetImage("suelo", "tiles");
    const escaleraSet = map.addTilesetImage("escalera", "escalera");

    const fondo = map.createLayer("Fondo", [sueloSet, escaleraSet], 0, 0).setDepth(-1);
    this.plataformas = map.createLayer("plataformas", [sueloSet, escaleraSet], 0, 0);
    this.plataformas.setCollisionByProperty({ esColisionable: true });

    const usables = map.createLayer("usables", [sueloSet, escaleraSet], 0, 0);
    this.escaleras = [];
    usables.forEachTile(t => { if (t.properties.esEscalable) this.escaleras.push(t); });

    // === FÍSICAS ===
    this.physics.world.gravity.y = 800;
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true, true, true, false);

    // === OBJETOS / SPAWNS ===
    const objetos = map.getObjectLayer("objetos").objects;
    this.spawn1 = objetos.find(o => o.name === "player");
    this.spawn2 = objetos.find(o => o.name === "player2");

    // === CONTROLES ===
    const keys1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      collect: Phaser.Input.Keyboard.KeyCodes.E, // Pinky
    });

    const keys2 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      collect: Phaser.Input.Keyboard.KeyCodes.ENTER, // Lamb
    });

    // === PERSONAJES ===
    const char1 = GameState.player1.character || "Pinky";
    const char2 = GameState.player2.character || "Lamb";

    this.player1 = new Player(this, this.spawn1.x, this.spawn1.y, char1, keys1, 1);
    this.player2 = new Player(this, this.spawn2.x, this.spawn2.y, char2, keys2, 2);

    this.physics.add.collider(this.player1, this.plataformas);
    this.physics.add.collider(this.player2, this.plataformas);

// === ENEMIGOS ===
this.enemies = this.add.group();
const enemyObjects = map.getObjectLayer("enemigos")?.objects || [];

enemyObjects.forEach((obj) => {
  const tipo = obj.name;
  const x = obj.x;
  const y = obj.y;
  const enemy = new Enemy(this, x, y, tipo, tipo, [this.player1, this.player2], this.audioManager);

  // 🔧 cuerpo físico y colisión
  enemy.body.setSize(enemy.width * 0.6, enemy.height * 0.8);
  enemy.body.setOffset(enemy.width * 0.2, enemy.height * 0.2);
  enemy.body.allowGravity = true;

  this.enemies.add(enemy);
  this.physics.add.collider(enemy, this.plataformas);
});

// 💥 Colisiones físicas jugador/enemigo
this.physics.add.collider(this.enemies, [this.player1, this.player2]);

// ⚔️ Detección de daño (solamente si colisionan o se acercan mucho)
this.physics.add.overlap(this.enemies, [this.player1, this.player2], (enemy, player) => {
  if (enemy instanceof Enemy && !enemy.isAttacking && !player.invulnerable) {
    enemy.attack(player); // usa el método del enemigo
  }
});



    // === CAJAS ===
    this.caja1 = this.physics.add.sprite(120, 560, "caja").setScale(1.1);
    this.caja2 = this.physics.add.sprite(960, 560, "caja").setScale(1.1);
    [this.caja1, this.caja2].forEach(c => { c.setImmovable(true); c.body.allowGravity = false; });

    // === DONAS ===
    this.recolectables = new Recolectables(this, objetos);
    this.recolectables.addColliders([this.player1, this.player2], [this.caja1, this.caja2]);

    // === CÁMARA ===
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // === HUD ===
    this.scene.launch("HUDScene");

    // === ESCALERAS ===
    this.addClimbLogic(this.player1, keys1);
    this.addClimbLogic(this.player2, keys2);

    // === COMBOS === 🆕
    this.combo1 = new Combo(this, this.player1);
    this.combo2 = new Combo(this, this.player2);

    events.on("heal-player", (playerId) => {
      const playerState = playerId === 1 ? GameState.player1 : GameState.player2;
      if (playerState.lives < 3) {
        playerState.lives++;
        events.emit("update-life", { playerID: playerId, vidas: playerState.lives });
      }
    });

    // === DAÑO DE ENEMIGOS === ⚔️
this.events.on("enemy-attack", (player) => {
  const id = player.id;
  const key = id === 1 ? "player1" : "player2";
  const state = GameState[key];

  if (!player.invulnerable && state.lives > 0) {
    // ✅ Resta una vida
    state.lives--;
    events.emit("update-life", { playerID: id, vidas: state.lives });

    // 🩸 Reacción del jugador
    this.audioManager.play("daño", { volume: 0.5 });
    player.invulnerable = true;

    // Pequeño parpadeo o sacudida visual
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => (player.alpha = 1),
    });

    // Desactivar invulnerabilidad luego de 1s
    this.time.delayedCall(1000, () => {
      player.invulnerable = false;
    });

    // 💀 Si pierde todas las vidas
    if (state.lives <= 0) {
      this.playerDied(player, id);
    }
  }
});



    // === MODOS ===
    if (GameState.mode === "versus") this.initVersus(objetos);
    if (GameState.mode === "coop") this.initCoop(objetos);

    // === FIN DE TIEMPO ===
    events.on("time-up", () => {
      const p1 = GameState.player1.donasRecolectadas || 0;
      const p2 = GameState.player2.donasRecolectadas || 0;
      const tiempo = this.scene.get("HUDScene")?.tiempo ?? 0;
      this.scene.stop("HUDScene");
      if (p1 === p2) return this.scene.start("EmpateScene", { p1, p2, tiempo });
      const winner = p1 > p2 ? "Jugador 1" : "Jugador 2";
      this.scene.start("VictoryScene", { winner, p1, p2, tiempo });
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("time-up");
    });
  }

  // === LÓGICA DE ESCALERAS ===
  addClimbLogic(player, keys) {
    player.isClimbing = false;
    this.events.on("update", () => {
      const onLadder = this.escaleras.some(tile =>
        Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), tile.getBounds())
      );
      if (onLadder) {
        player.isClimbing = true;
        player.body.allowGravity = false;
        player.setVelocityY(0);
        if (keys.up.isDown) player.y -= 3;
        else if (keys.down && keys.down.isDown) player.y += 3;
      } else if (player.isClimbing) {
        player.isClimbing = false;
        player.body.allowGravity = true;
      }
    });
  }

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

  events.on("dona-recolectada", (playerId) => {
    if (playerId === 1) GameState.player1.donasRecolectadas++;
    if (playerId === 2) GameState.player2.donasRecolectadas++;
  });

  this.physics.add.collider(this.player1, this.player2, () => {
    const diff = this.player1.x - this.player2.x;
    if (diff > 0) { this.player1.x += 5; this.player2.x -= 5; }
    else          { this.player1.x -= 5; this.player2.x += 5; }
  });

  // 🕒 En lugar de crear un temporizador nuevo,
  // observamos el del HUD y reaccionamos cuando se acabe.
  const hud = this.scene.get("HUDScene");
  if (hud) {
    hud.events.once("time-up", () => events.emit("time-up"));
  }
}

  initCoop() {}

  // === UPDATE ===
  update() {
    this.player1.update();
    this.player2.update();

// === ACTUALIZAR ENEMIGOS ===
this.enemies.children.iterate((enemy) => {
  if (enemy) enemy.update();
});

    // === MOVIMIENTO DE CÁMARA DINÁMICO ===
    const cam = this.cameras.main;
    const centerX = (this.player1.x + this.player2.x) / 2;
    const centerY = (this.player1.y + this.player2.y) / 2;
    const lerp = 0.08;
    cam.scrollX += (centerX - cam.midPoint.x) * lerp;
    cam.scrollY += (centerY - cam.midPoint.y) * lerp;

    const distanceX = Math.abs(this.player1.x - this.player2.x);
    const distanceY = Math.abs(this.player1.y - this.player2.y);
    const distance = Math.max(distanceX, distanceY);
    const targetZoom = Phaser.Math.Clamp(1.2 - distance / 1200, 0.85, 1.2);
    cam.zoom = Phaser.Math.Linear(cam.zoom, targetZoom, 0.05);

    // === AJUSTE AUTOMÁTICO DE FONDOS ===
    const viewW = this.scale.width / cam.zoom;
    const viewH = this.scale.height / cam.zoom;
    const offsetX = cam.midPoint.x;
    const offsetY = cam.midPoint.y;
    this.bgLayers.forEach(layer => {
      layer.x = offsetX;
      layer.y = offsetY;
      layer.displayWidth = viewW * 1.4;
      layer.displayHeight = viewH * 1.4;
    });
    this.bgStars.x = offsetX;
    this.bgStars.y = offsetY;
    this.bgStars.displayWidth = viewW * 1.6;
    this.bgStars.displayHeight = viewH * 1.6;
    this.bgStars.tilePositionX += 0.4;
    this.bgStars.tilePositionY = Math.sin(this.time.now * 0.001) * 4;
    const zoomElastic = (1 - cam.zoom) * 200;
    this.bgCloudsFar.y = offsetY + zoomElastic * 0.2;
    this.bgCloudsMid.y = offsetY + zoomElastic * 0.4;
    this.bgCloudsFront.y = offsetY + zoomElastic * 0.6;

    // === COMBOS DE SALUD === 🆕
    if (!this.combo1.isActive && GameState.player1.lives < 3 && Phaser.Math.Between(0, 1000) < 2) {
      this.combo1.start();
    }
    if (!this.combo2.isActive && GameState.player2.lives < 3 && Phaser.Math.Between(0, 1000) < 2) {
      this.combo2.start();
    }

    // === VERIFICAR CAÍDAS ===
    const worldHeight = this.physics.world.bounds.height;
    if (!this.player1.invulnerable && this.player1.y > worldHeight + 100) this.playerDied(this.player1, 1);
    if (!this.player2.invulnerable && this.player2.y > worldHeight + 100) this.playerDied(this.player2, 2);
  }

  // === MUERTE / RESPAWN ===
  playerDied(player, id) {
    const key = id === 1 ? "player1" : "player2";
    const st = GameState[key];
    if (!player.active || player.invulnerable) return;

    if (st.lives > 1) {
      st.lives--;
      events.emit("update-life", { playerID: id, vidas: st.lives });
      player.invulnerable = true;
      player.body.allowGravity = false;
      player.body.setVelocity(0, 0);
      player.body.setAcceleration(0, 0);
      player.body.checkCollision.none = true;

      const spawn = id === 1 ? this.spawn1 : this.spawn2;
      const safeY = Math.max(0, spawn.y - 12);
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
        onComplete: () => { player.alpha = 1; player.setScale(1); },
      });

      this.time.delayedCall(1000, () => {
        player.body.allowGravity = true;
        player.body.checkCollision.none = false;
        player.invulnerable = false;
        player.body.setVelocityY(-120);
      });
      return;
    }

    st.lives = 0;
    player.setActive(false).setVisible(false);
    player.body.enable = false;

    const p1 = GameState.player1.donasRecolectadas || 0;
    const p2 = GameState.player2.donasRecolectadas || 0;
    const tiempo = this.scene.get("HUDScene")?.tiempo ?? 0;
    const winner = id === 1 ? "Jugador 2" : "Jugador 1";
    this.time.delayedCall(800, () => {
      this.scene.start("GameOver", { winner, p1, p2, tiempo, motivo: "sin vidas" });
    });
  }
}
