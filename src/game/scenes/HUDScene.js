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
    // TÍTULO + TIMER (título arriba)
    // ========================================

    const modoTexto =
      GameState.mode === "coop" ? "MODO COOPERATIVO" : "MODO VERSUS";

    // TÍTULO ARRIBA
    this.add.text(W / 2, 15, modoTexto, {
      fontFamily: '"Press Start 2P"',
      fontSize: 20,
      stroke: "#000",
      strokeThickness: 6,
      color: GameState.mode === "coop" ? "#66ff66" : "#ff66cc",
    })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // TIMER DEBAJO DEL TÍTULO
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
    //                        COOPERATIVO (VIDA COMPARTIDA)
    // ==========================================================

    if (GameState.mode === "coop") {

      const vidas = GameState.sharedLives ?? 6;

      // ❤️❤️❤️❤️❤️❤️ 6 corazones en fila
      this.sharedHearts = this.addHearts(30, 95, vidas, 6);

      // DONAS COMPARTIDAS
      const total =
        (GameState.player1.donasRecolectadas || 0) +
        (GameState.player2.donasRecolectadas || 0);

      this.add
        .rectangle(W / 2, 135, 230, 55, 0x000000, 0.45)
        .setOrigin(0.5)
        .setScrollFactor(0);

      this.add.image(W / 2 - 70, 135, "donas")
        .setScale(1.2)
        .setScrollFactor(0);

      this.playerDonas = {};
      this.playerDonas.shared = this.add
        .text(W / 2 - 10, 117, total.toString(), {
          fontFamily: '"Press Start 2P"',
          fontSize: 24,
          color: "#ffddf5",
          stroke: "#000000",
          strokeThickness: 6,
        })
        .setOrigin(0, 0)
        .setScrollFactor(0);
    }

    // ==========================================================
    //                           VERSUS
    // ==========================================================

    if (GameState.mode === "versus") {

      this.playerDonas = {};

      // ❤️ HEARTS P1
      this.heartsP1 = this.addHearts(30, 95, GameState.player1.lives);

      // ❤️ HEARTS P2
      this.heartsP2 = this.addHearts(W - 160, 95, GameState.player2.lives);

      // DONAS P1
      this.add
        .rectangle(80, 150, 150, 55, 0x000000, 0.45)
        .setOrigin(0.5)
        .setScrollFactor(0);

      this.add.image(30, 150, "donas")
        .setScale(1.1)
        .setScrollFactor(0);

      this.playerDonas.P1 = this.add
        .text(75, 132, GameState.player1.donasRecolectadas || "0", {
          fontFamily: '"Press Start 2P"',
          fontSize: 22,
          color: "#ff99cc",
          stroke: "#000",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setScrollFactor(0);

      // DONAS P2
      this.add
        .rectangle(W - 80, 150, 150, 55, 0x000000, 0.45)
        .setOrigin(0.5)
        .setScrollFactor(0);

      this.add.image(W - 135, 150, "donas")
        .setScale(1.1)
        .setScrollFactor(0);

      this.playerDonas.P2 = this.add
        .text(W - 85, 132, GameState.player2.donasRecolectadas || "0", {
          fontFamily: '"Press Start 2P"',
          fontSize: 22,
          color: "#99ccff",
          stroke: "#000",
          strokeThickness: 6,
        })
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
        return;
      }

      if (GameState.mode === "versus") {
        if (playerID === 1) {
          this.playerDonas.P1.setText(cantidad);
          this.animateDonutPop(this.playerDonas.P1);
        }
        if (playerID === 2) {
          this.playerDonas.P2.setText(cantidad);
          this.animateDonutPop(this.playerDonas.P2);
        }
      }
    });

    events.on("update-life", ({ playerID, vidas }) => {

      // ❤️ COOP → vidas compartidas
      if (GameState.mode === "coop") {
        GameState.sharedLives = vidas;

        this.updateHearts(this.sharedHearts, vidas);

        if (vidas >= 0 && vidas < this.sharedHearts.length) {
          this.animateHeartBeat(this.sharedHearts[vidas]);
        }
        return;
      }

      // ❤️ VERSUS
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

  // ✨ POP DONA
  animateDonutPop(donutText) {
    this.tweens.add({
      targets: donutText,
      scale: { from: 1.0, to: 1.3 },
      yoyo: true,
      duration: 120,
      ease: "Quad.easeOut",
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

  // 🕒 timer
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
