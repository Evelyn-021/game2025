import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class VictoryScene extends Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data) {
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Fondo
    this.add.rectangle(512, 384, 1024, 768, 0x0a2a43, 1);

    // 🏁 Título
    this.add.text(512, 120, "🏆 CLASIFICACIÓN FINAL 🏆", {
      fontFamily: "PixelFont",
      fontSize: 56,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    // === DATOS DE JUEGO ===
    const p1Donas = GameState.player1.donasRecolectadas || 0;
    const p2Donas = GameState.player2.donasRecolectadas || 0;

    const jugadores = [
      { nombre: "Jugador 1", color: "#ff99cc", donas: p1Donas },
      { nombre: "Jugador 2", color: "#99ccff", donas: p2Donas }
    ];

    // Ordenar por donas (mayor primero)
    jugadores.sort((a, b) => b.donas - a.donas);

    // 🥇 Ganador
    const winner = jugadores[0].donas === jugadores[1].donas
      ? "Empate"
      : jugadores[0].nombre;

    // === GUARDAR RÉCORD ===
    const bestRecord = JSON.parse(localStorage.getItem("bestRecord")) || { winner: "Nadie", donas: 0 };
    const currentBest = jugadores[0].donas;

    if (currentBest > bestRecord.donas) {
      localStorage.setItem("bestRecord", JSON.stringify({
        winner,
        donas: currentBest,
      }));
    }

    const updatedBest = JSON.parse(localStorage.getItem("bestRecord"));

    // === TABLA ===
    const tableX = 512;
    let startY = 220;

    // Cabecera
    this.add.text(tableX, startY, "Jugador       |   Donas Recolectadas", {
      fontFamily: "PixelFont",
      fontSize: 28,
      color: "#ffff99",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);
    startY += 50;

    // Filas
    jugadores.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : "🥈";
      const text = `${medal} ${p.nombre.padEnd(10)}   ${p.donas}`;
      this.add.text(tableX, startY, text, {
        fontFamily: "PixelFont",
        fontSize: 28,
        color: p.color,
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5);
      startY += 40;
    });

    // Línea divisoria
    this.add.rectangle(512, startY + 10, 400, 2, 0xffffff, 0.3);

    // 🏅 Récord actual
    this.add.text(512, startY + 50, `🏅 Récord actual: ${updatedBest.winner} (${updatedBest.donas} donas)`, {
      fontFamily: "PixelFont",
      fontSize: 26,
      color: "#ffffcc",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    // === Instrucciones ===
    this.add.text(512, 640, "Presiona ENTER para volver al menú", {
      fontFamily: "PixelFont",
      fontSize: 22,
      color: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(512, 680, "Presiona R para pedir revancha", {
      fontFamily: "PixelFont",
      fontSize: 22,
      color: "#ffcc00",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // === CONTROLES ===
    this.input.keyboard.once("keydown-ENTER", () => {
      GameState.reset();
      this.scene.start("MainMenu");
    });

    this.input.keyboard.once("keydown-R", () => {
      GameState.reset();
      this.scene.stop("HUDScene");
      this.scene.start("Game");
    });
  }
}
