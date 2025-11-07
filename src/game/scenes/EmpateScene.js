import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class EmpateScene extends Scene {
  constructor() {
    super("EmpateScene");
  }

  create(data) {
    const { p1 = 0, p2 = 0, tiempo = 0 } = data;

    this.cameras.main.setBackgroundColor("#0b1f33");

    this.add.text(512, 100, "🤝 EMPATE 🤝", {
      fontFamily: "Arial Black",
      fontSize: 64,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(512, 180, "Ambos jugadores recolectaron la misma cantidad de donas", {
      fontSize: 24, color: "#ffcc88",
    }).setOrigin(0.5);

    this.add.text(512, 240, `Jugador 1: ${p1} donas`, {
      fontSize: 32, color: "#ff6699",
    }).setOrigin(0.5);

    this.add.text(512, 280, `Jugador 2: ${p2} donas`, {
      fontSize: 32, color: "#66ccff",
    }).setOrigin(0.5);

    this.add.text(512, 330, `⏱️ Tiempo: ${tiempo}s`, {
      fontSize: 22, color: "#aaffaa",
    }).setOrigin(0.5);

    const best = JSON.parse(localStorage.getItem("bestRecord")) || { winner: "Nadie", donas: 0 };
    this.add.text(512, 380, `🥇 Récord actual: ${best.winner} (${best.donas} donas)`, {
      fontSize: 22, color: "#ffff88",
    }).setOrigin(0.5);

    this.add.text(512, 460, "Presiona R para Revancha 🔁", {
      fontSize: 28, color: "#ffcc00", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(512, 505, "Presiona ENTER para volver al Menú", {
      fontSize: 22, color: "#ffffff",
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
