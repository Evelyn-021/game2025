import Phaser from "phaser";
import { events } from "../../classes/GameEvents.js";
import { GameState } from "../state/GameState.js";

export class HUDScene extends Phaser.Scene {
  constructor() {
    super("HUDScene");
  }

  create() {
    const gameScene = this.scene.get("Game");
    if (!gameScene || !gameScene.scene.isActive()) {
      this.scene.stop();
      return;
    }

    const W = this.scale.width;

    // ========================================
    // TÍTULO + TIMER
    // ========================================

    const modoTexto =
      GameState.mode === "coop" ? "MODO COOPERATIVO" : "MODO VERSUS";

    this.add.text(W / 2, 15, modoTexto, {
      fontFamily: '"Press Start 2P"',
      fontSize: 20,
      stroke: "#000",
      strokeThickness: 6,
      color: GameState.mode === "coop" ? "#66ff66" : "#ff66cc",
    })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // TIMER
    this.timeLeft = 120;

    this.timerText = this.add.text(W / 2, 50, "02:00", {
      fontFamily: '"Press Start 2P"',
      fontSize: 20,
      stroke: "#000",
      strokeThickness: 6,
      color: "#ffffff",
    })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // ==========================================================
    //                        COOPERATIVO
    // ==========================================================
    if (GameState.mode === "coop") {
      const vidas = GameState.sharedLives ?? 6;

      const totalDonas =
        (GameState.player1.donasRecolectadas || 0) +
        (GameState.player2.donasRecolectadas || 0);

      // =======================
      // ❤️ CORAZONES ARRIBA IZQUIERDA
      // =======================
      this.sharedHearts = this.addHearts(30, 65, vidas, 6);

      // =======================
      // 🍩 DONAS ARRIBA DERECHA
      // =======================

      // Fondo de caja
      this.add
        .rectangle(W - 150, 65, 230, 55, 0x000000, 0.45)
        .setOrigin(0.5)
        .setScrollFactor(0);

      // Ícono de dona (GUARDADO PARA ANIMAR)
      this.donaIcon = this.add.image(W - 240, 65, "donas")
        .setScale(1.2)
        .setOrigin(0.5)
        .setScrollFactor(0);

      // Número de donas
      this.playerDonas = {};
      this.playerDonas.shared = this.add
        .text(W - 200, 47, totalDonas.toString(), {
          fontFamily: '"Press Start 2P"',
          fontSize: 22,
          color: "#ffddf5",
          stroke: "#000",
          strokeThickness: 6,
        })
        .setOrigin(0, 0)
        .setScrollFactor(0);

      // Meta de donas
      const meta = GameState.metaDonas || 30;

      this.metaDonasText = this.add.text(
        W - 120,
        47,
        `/ ${meta}`,
        {
          fontFamily: '"Press Start 2P"',
          fontSize: 20,
          color: "#ffffff",
          stroke: "#000",
          strokeThickness: 6,
        }
      )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    }

    // ==========================================================
//                      VERSUS
// ==========================================================
if (GameState.mode === "versus") {
  this.playerDonas = {};

  // ===========================
  // ❤️ CORAZONES JUGADOR 1
  // ===========================
  this.heartsP1 = this.addHearts(40, 40, GameState.player1.lives);

  // ===========================
  // ❤️ CORAZONES JUGADOR 2
  // ===========================
  this.heartsP2 = this.addHearts(W - 200, 40, GameState.player2.lives);

  // ===========================
  // 🍩 DONAS JUGADOR 1
  // ===========================

  // Fondo gris oscuro P1
  this.add.rectangle(120, 100, 170, 55, 0x000000, 0.45)
    .setOrigin(0.5)
    .setScrollFactor(0);

  // Ícono de dona P1 (GUARDAR REFERENCIA)
  this.donaP1 = this.add.image(60, 100, "donas")
    .setScale(1.1)
    .setScrollFactor(0)
    .setOrigin(0.5);

  // Texto número P1
  this.playerDonas.P1 = this.add.text(
    130, 100,
    GameState.player1.donasRecolectadas || "0",
    {
      fontFamily: '"Press Start 2P"',
      fontSize: 22,
      color: "#ff99cc",
      stroke: "#000",
      strokeThickness: 6,
    }
  )
    .setOrigin(0.5)
    .setScrollFactor(0);

  // ===========================
  // 🍩 DONAS JUGADOR 2
  // ===========================

  this.add.rectangle(W - 120, 100, 170, 55, 0x000000, 0.45)
    .setOrigin(0.5)
    .setScrollFactor(0);

  this.donaP2 = this.add.image(W - 180, 100, "donas")
    .setScale(1.1)
    .setScrollFactor(0)
    .setOrigin(0.5);

  this.playerDonas.P2 = this.add.text(
    W - 115, 100,
    GameState.player2.donasRecolectadas || "0",
    {
      fontFamily: '"Press Start 2P"',
      fontSize: 22,
      color: "#99ccff",
      stroke: "#000",
      strokeThickness: 6,
    }
  )
    .setOrigin(0.5)
    .setScrollFactor(0);
}


    // ==========================================================
    // EVENTOS + ANIMACIONES
    // ==========================================================

    events.on("update-donas", ({ playerID, cantidad }) => {
  
  if (GameState.mode === "coop") {
    this.playerDonas.shared.setText(cantidad);
    this.animateDonutPop(this.playerDonas.shared);
    this.animateDonutIcon();
    return;
  }

  // 🎮 VERSUS
  if (playerID === 1) {
    this.playerDonas.P1.setText(cantidad);

    this.animateDonutPop(this.playerDonas.P1);
    this.tweens.add({
      targets: this.donaP1,
      scale: { from: 1.1, to: 1.35 },
      yoyo: true,
      duration: 150,
      ease: "Back.easeOut",
    });
  }

  if (playerID === 2) {
    this.playerDonas.P2.setText(cantidad);

    this.animateDonutPop(this.playerDonas.P2);
    this.tweens.add({
      targets: this.donaP2,
      scale: { from: 1.1, to: 1.35 },
      yoyo: true,
      duration: 150,
      ease: "Back.easeOut",
    });
  }
});


    events.on("update-life", ({ playerID, vidas }) => {
  console.log("🫀 HUD recibió update-life:", { playerID, vidas }); // Debug
  
  // Coop
  if (GameState.mode === "coop") {
    GameState.sharedLives = vidas;

    // 🔥 CORREGIDO: Usar this.sharedHearts que ya existe
    if (this.sharedHearts) {
      this.updateHearts(this.sharedHearts, vidas);

      if (vidas >= 0 && vidas < this.sharedHearts.length) {
        this.animateHeartBeat(this.sharedHearts[vidas]);
      }
    }
    return;
  }

  // Versus
  const hearts = playerID === 1 ? this.heartsP1 : this.heartsP2;
  this.updateHearts(hearts, vidas);

  if (vidas >= 0 && vidas < hearts.length) {
    this.animateHeartBeat(hearts[vidas]);
  }
});
  }

  // ❤️ Crear corazones
  addHearts(x, y, vidasActuales, maxVidas = 3) {
    const hearts = [];
    for (let i = 0; i < maxVidas; i++) {
      const frame = i < vidasActuales ? 0 : 1;
      hearts.push(
        this.add
          .sprite(x + i * 35, y, "health", frame)
          .setScrollFactor(0)
          .setScale(1.15)
      );
    }
    return hearts;
  }

  updateHearts(hearts, vidas) {
    hearts.forEach((heart, i) => {
      heart.setFrame(i < vidas ? 0 : 1);
    });
  }

  // ✨ POP número
  animateDonutPop(donutText) {
    this.tweens.add({
      targets: donutText,
      scale: { from: 1.0, to: 1.3 },
      yoyo: true,
      duration: 120,
      ease: "Quad.easeOut",
    });
  }

  // ✨ POP ÍCONO DE DONA
  animateDonutIcon() {
    this.tweens.add({
      targets: this.donaIcon,
      scale: { from: 1.2, to: 1.5 },
      yoyo: true,
      duration: 140,
      ease: "Back.easeOut",
    });
  }

  // ✨ LATIDO CORAZÓN
  animateHeartBeat(heartSprite) {
    this.tweens.add({
      targets: heartSprite,
      scale: { from: 1.15, to: 1.35 },
      yoyo: true,
      duration: 140,
      ease: "Cubic.easeOut",
    });
  }

  // 🕒 Timer
  updateTimer() {
    this.timeLeft--;
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;

    this.timerText.setText(
      `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    );

    if (this.timeLeft <= 0) {
      this.timerEvent.remove(false);
      events.emit("time-up");
    }
  }
}
