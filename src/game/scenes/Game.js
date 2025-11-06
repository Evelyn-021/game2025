import { Scene } from "phaser";
import Player from "../../classes/player.js";
import Recolectables from "../../classes/recolectables.js";
import { GameState } from "../state/GameState.js";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  create() {
    // === FONDO ===
    this.bg = this.add.image(0, 0, "background2")
      .setOrigin(0, 0)
      .setScrollFactor(0.5)
      .setScale(1.1);

    // === TILEMAP ===
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("suelo", "tiles");
    this.plataformas = map.createLayer("plataformas", tileset, 0, 0);
    this.plataformas.setCollisionByProperty({ esColisionable: true });

    // === FÍSICAS DEL MUNDO ===
    this.physics.world.gravity.y = 800;
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels, true, true, true, false);

    // === CAPA DE OBJETOS ===
    const objetos = map.getObjectLayer("objetos").objects;
    const spawn1 = objetos.find(o => o.name === "player");
    const spawn2 = objetos.find(o => o.name === "player2");

    // === CONTROLES ===
    const keys1 = this.input.keyboard.createCursorKeys();
    const keys2 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // === PERSONAJES SELECCIONADOS (desde GameState) ===
    const char1 = GameState.player1.character || "Pinky";
    const char2 = GameState.player2.character || "Lamb";

    console.log(`🎮 Jugador 1: ${char1}`);
    console.log(`🎮 Jugador 2: ${char2}`);

    // === CREAR JUGADORES ===
    this.player1 = new Player(this, spawn1.x, spawn1.y, char1, keys1, 1);
    this.player2 = new Player(this, spawn2.x, spawn2.y, char2, keys2, 2);

    this.physics.add.collider(this.player1, this.plataformas);
    this.physics.add.collider(this.player2, this.plataformas);

    // === DONAS ===
    this.recolectables = new Recolectables(this, objetos);
    this.recolectables.addColliders([this.player1, this.player2]);

    // === CÁMARA ===
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBackgroundColor("#bdeaff");

    // === HUD ===
    this.scene.launch("HUDScene");

    // === MODO DE JUEGO ===
    if (GameState.mode === "versus") this.initVersus(objetos);
    if (GameState.mode === "coop") this.initCoop(objetos);
  }

  // 🧩 Modo Versus
  initVersus(objetos) {
    console.log("Versus mode");
  }

  // 🧩 Modo Coop
  initCoop(objetos) {
    console.log("Coop mode");
  }

  // 🕹️ Update general
  update() {
    this.player1.update();
    this.player2.update();

    // === Cámara centrada entre ambos jugadores ===
    const centerX = (this.player1.x + this.player2.x) / 2;
    const centerY = (this.player1.y + this.player2.y) / 2;
    this.cameras.main.centerOn(centerX, centerY);

    // === Detección de caída fuera del mundo ===
    const worldHeight = this.physics.world.bounds.height;
    if (this.player1.y > worldHeight + 100) {
      this.playerDied(this.player1, 1);
    }
    if (this.player2.y > worldHeight + 100) {
      this.playerDied(this.player2, 2);
    }
  }

  // 💀 Si un jugador muere (cae fuera del mapa)
  playerDied(player, id) {
    if (!player.active) return; // evita múltiples llamadas

    console.log(`💀 Jugador ${id} (${player.texture.key}) murió`);
    player.setActive(false).setVisible(false);
    player.body.enable = false;

    // Determinar ganador
    const winner = id === 1 ? "Jugador 2" : "Jugador 1";
    this.time.delayedCall(500, () => {
      this.scene.start("GameOver", { winner });
    });
  }
}
