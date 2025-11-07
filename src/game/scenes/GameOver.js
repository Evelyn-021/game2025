import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  init(data) {
    this.dataFin = data; // { winner, p1, p2, tiempo, motivo? }
  }

  create() {
    const { winner, p1 = 0, p2 = 0, tiempo = 0, motivo } = this.dataFin;

    this.cameras.main.setBackgroundColor("#0b1f33");

    this.add.text(512, 120, `${winner} gana 🎉`, {
      fontFamily: "Arial Black",
      fontSize: 56,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    if (motivo) {
      this.add.text(512, 165, `Motivo: ${motivo}`, {
        fontSize: 22, color: "#ff9999"
      }).setOrigin(0.5);
    }

    // Resumen
    this.add.text(512, 225, `Jugador 1: ${p1} donas | Jugador 2: ${p2} donas`, {
      fontSize: 24, color: "#ffcc88"
    }).setOrigin(0.5);

    this.add.text(512, 260, `⏱️ Tiempo: ${tiempo}s`, {
      fontSize: 22, color: "#aaffaa"
    }).setOrigin(0.5);

    // Record
    const best = JSON.parse(localStorage.getItem("bestRecord")) || { winner: "Nadie", donas: 0 };
    const ganadorDonas = winner === "Jugador 1" ? p1 : p2;

    if (ganadorDonas > best.donas) {
      localStorage.setItem("bestRecord", JSON.stringify({ winner, donas: ganadorDonas }));
    }
    const updated = JSON.parse(localStorage.getItem("bestRecord"));

    this.add.text(512, 310, `🥇 Récord: ${updated.winner} (${updated.donas} donas)`, {
      fontSize: 22, color: "#ffff88"
    }).setOrigin(0.5);

    // Tabla simple
    this.add.text(512, 360, "📋 CLASIFICACIÓN", {
      fontSize: 26, color: "#ffffff"
    }).setOrigin(0.5);
    this.add.text(512, 395, `Jugador 1 — ${p1}`, { fontSize: 24, color: "#ff6699" }).setOrigin(0.5);
    this.add.text(512, 425, `Jugador 2 — ${p2}`, { fontSize: 24, color: "#66ccff" }).setOrigin(0.5);

    // Controles
    this.add.text(512, 500, "Presiona R para Revancha 🔁", {
      fontSize: 26, color: "#ffcc00", stroke: "#000", strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(512, 540, "Presiona ENTER para volver al Menú", {
      fontSize: 22, color: "#ffffff"
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-R", () => {
      GameState.reset();
      this.scene.stop("HUDScene");
      this.scene.start("Game");
    });

    this.input.keyboard.once("keydown-ENTER", () => {
      GameState.reset();
      this.scene.start("MainMenu");
    });
  }
}
