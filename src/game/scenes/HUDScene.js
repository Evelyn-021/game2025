// src/game/scenes/HUDScene.js
import Phaser from "phaser";
import { events } from "../../classes/GameEvents.js";

export class HUDScene extends Phaser.Scene {
  constructor() {
    super("HUDScene");
  }

  create() {
    // 🔍 Verifica si la escena Game está activa y no destruida
    const gameScene = this.scene.get("Game");
    const gameOverScene = this.scene.get("GameOver");
    const mainMenu = this.scene.get("MainMenu");

    if (
      !gameScene ||
      !gameScene.scene.isActive() ||
      gameScene.sys.isDestroyed ||
      (gameOverScene && gameOverScene.scene.isActive()) ||
      (mainMenu && mainMenu.scene.isActive())
    ) {
      console.warn("⛔ HUD detenido: fuera de partida o escena reiniciada.");
      this.scene.stop();
      return;
    }

    // === CONFIGURACIÓN ===
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    // === ELEMENTOS VISUALES ===
    this.playerScores = {};

    // Jugador 1 (izquierda)
    this.add.image(30, 40, "donas").setScrollFactor(0).setScale(0.6);
    this.playerScores.P1 = this.add.text(70, 28, "0", {
      fontFamily: "PixelFont",
      fontSize: 24,
      color: "#ff66cc"
    }).setScrollFactor(0);

    // Jugador 2 (derecha)
    this.add.image(960, 40, "donas").setScrollFactor(0).setScale(0.6);
    this.playerScores.P2 = this.add.text(900, 28, "0", {
      fontFamily: "PixelFont",
      fontSize: 24,
      color: "#66ccff"
    }).setScrollFactor(0);

    // === EVENTO DE ACTUALIZACIÓN DE PUNTAJE ===
    events.on("update-score", ({ playerID, score }) => {
      if (playerID === 1) this.playerScores.P1.setText(score);
      if (playerID === 2) this.playerScores.P2.setText(score);
    });

    // === ESCUCHA DE REINICIO DE ESCENAS ===
    this.scene.get("Game").events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop("HUDScene");
    });

    // === LIMPIEZA ===
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("update-score");
    });
  }
}
