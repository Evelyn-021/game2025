import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class VictoryScene extends Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data) {
    const { winner, p1 = 0, p2 = 0, tiempo = 0 } = data;

    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.add.rectangle(512, 384, 1024, 768, 0x0a2a43, 1);

    this.add.text(512, 80, "🏆 CLASIFICACIÓN FINAL 🏆", {
      fontFamily: "PixelFont",
      fontSize: 56,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(512, 130, `${winner} gana 🎉 — ⏱️ ${tiempo}s`, {
      fontSize: 24, color: "#ffcc88"
    }).setOrigin(0.5);

    const jugadores = [
      { nombre: "Jugador 1", color: "#ff99cc", donas: p1 },
      { nombre: "Jugador 2", color: "#99ccff", donas: p2 }
    ].sort((a, b) => b.donas - a.donas);

    const bestRecord = JSON.parse(localStorage.getItem("bestRecord")) || { winner: "Nadie", donas: 0 };
    const currentBest = jugadores[0].donas;
    if (currentBest > bestRecord.donas) {
      localStorage.setItem("bestRecord", JSON.stringify({ winner, donas: currentBest }));
    }
    const updatedBest = JSON.parse(localStorage.getItem("bestRecord"));

    let y = 210;
    this.add.text(512, y, "Jugador       |   Donas Recolectadas", {
      fontFamily: "PixelFont", fontSize: 28, color: "#ffff99", stroke: "#000", strokeThickness: 4,
    }).setOrigin(0.5);
    y += 48;

    jugadores.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : "🥈";
      this.add.text(512, y, `${medal} ${p.nombre.padEnd(10)}   ${p.donas}`, {
        fontFamily: "PixelFont", fontSize: 28, color: p.color, stroke: "#000", strokeThickness: 4,
      }).setOrigin(0.5);
      y += 40;
    });

    this.add.rectangle(512, y + 10, 400, 2, 0xffffff, 0.3);
    this.add.text(512, y + 46, `🥇 Récord actual: ${updatedBest.winner} (${updatedBest.donas} donas)`, {
      fontFamily: "PixelFont", fontSize: 26, color: "#ffffcc", stroke: "#000", strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(512, 640, "Presiona R para Revancha 🔁", {
      fontFamily: "PixelFont", fontSize: 24, color: "#ffcc00", stroke: "#000", strokeThickness: 3,
    }).setOrigin(0.5);
    this.add.text(512, 675, "Presiona ENTER para volver al Menú", {
      fontFamily: "PixelFont", fontSize: 22, color: "#ffffff",
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
