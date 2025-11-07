import Phaser from "phaser";
import { events } from "../../classes/GameEvents.js";

export class HUDScene extends Phaser.Scene {
  constructor() {
    super("HUDScene");
  }

  create() {
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

    // === CONFIGURACIÓN GENERAL ===
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    this.playerDonas = {};

    // === CONTENEDOR JUGADOR 1 ===
    this.add.rectangle(80, 40, 130, 50, 0x000000, 0.4)
      .setScrollFactor(0)
      .setOrigin(0.5);

    this.add.image(30, 40, "donas").setScrollFactor(0).setScale(0.9);
    this.playerDonas.P1 = this.add.text(70, 28, "0", {
      fontFamily: "PixelFont",
      fontSize: 28,
      color: "#ff99cc",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setScrollFactor(0);

    // ❤️ VIDAS JUGADOR 1
    this.heartsP1 = this.addHearts(30, 70);

    // === CONTENEDOR JUGADOR 2 ===
    this.add.rectangle(940, 40, 130, 50, 0x000000, 0.4)
      .setScrollFactor(0)
      .setOrigin(0.5);

    this.add.image(960, 40, "donas").setScrollFactor(0).setScale(0.9);
    this.playerDonas.P2 = this.add.text(900, 28, "0", {
      fontFamily: "PixelFont",
      fontSize: 28,
      color: "#99ccff",
      stroke: "#ffffff",
      strokeThickness: 4,
    }).setScrollFactor(0);

    // ❤️ VIDAS JUGADOR 2
    this.heartsP2 = this.addHearts(870, 70);

    // === CRONÓMETRO CENTRAL ===
    this.timeLeft = 120; // 2 minutos = 120 segundos
    this.timerText = this.add.text(512, 40, "02:00", {
      fontFamily: "PixelFont",
      fontSize: 40,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // === EVENTOS ===
    events.on("update-donas", ({ playerID, cantidad }) => {
      if (playerID === 1) this.playerDonas.P1.setText(cantidad);
      if (playerID === 2) this.playerDonas.P2.setText(cantidad);
    });

    // Cuando un jugador pierde una vida
    events.on("update-life", ({ playerID, vidas }) => {
      if (playerID === 1) this.updateHearts(this.heartsP1, vidas);
      if (playerID === 2) this.updateHearts(this.heartsP2, vidas);
    });

    // === LIMPIEZA ===
    this.scene.get("Game").events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop("HUDScene");
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off("update-donas");
      events.off("update-life");
    });
  }

  // ❤️ Dibuja tres corazones (por defecto llenos)
  addHearts(x, y) {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add
        .sprite(x + i * 35, y, "health", 0) // frame 0 = lleno
        .setScrollFactor(0)
        .setScale(1.2);
      hearts.push(heart);
    }
    return hearts;
  }

  // 💔 Actualiza corazones según las vidas
  updateHearts(hearts, vidas) {
    hearts.forEach((heart, index) => {
      heart.setFrame(index < vidas ? 0 : 1); // 0 = lleno, 1 = vacío
    });
  }

  // 🕒 Función del temporizador
  updateTimer() {
    this.timeLeft--;

    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    this.timerText.setText(formattedTime);

    // Últimos 10 segundos → efecto visual
    if (this.timeLeft <= 10) {
      this.timerText.setColor("#ff0000");
      this.timerText.setStroke("#ffffff", 6);

      // Parpadeo
      this.tweens.add({
        targets: this.timerText,
        alpha: 0.3,
        duration: 300,
        yoyo: true,
        repeat: 0,
      });
    }

    // Se acabó el tiempo
    if (this.timeLeft <= 0) {
      this.timerEvent.remove(false);
      events.emit("time-up"); // 🔔 Avisar al Game
    }
  }
}