import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class VictoryScene extends Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data) {
    const { winner, p1 = 0, p2 = 0, tiempo = 0 } = data;

    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // 🎯 FONDO ARCOÍRIS PIXELADO
    const colors = [0xff3366, 0xff9933, 0xffff33, 0x33ff66, 0x3366ff, 0x9933ff];
    colors.forEach((color, i) => {
      this.add.rectangle(W / 2, 150 + (i * 40), W, 40, color).setAlpha(0.3);
    });

    // 🏆 TÍTULO VICTORY
    this.add.text(W / 2, 80, "VICTORY!", {
      fontFamily: '"Press Start 2P"',
      fontSize: 64,
      color: "#ffff00",
      stroke: "#ff6600",
      strokeThickness: 8,
      shadow: {
        offsetX: 6,
        offsetY: 6,
        color: '#ff0000',
        blur: 0,
        fill: true
      }
    }).setOrigin(0.5);

    // ==============================
    // MENSAJE SEGÚN MODO
    // ==============================

    if (GameState.mode === "versus") {
      // 🟥 VERSUS normal
      this.add.text(W / 2, 160, `${winner.toUpperCase()} WINS!`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 28,
        color: "#ffffff",
        stroke: "#0000ff",
        strokeThickness: 5
      }).setOrigin(0.5);

      this.add.text(W / 2, 200, `TIME: ${tiempo}s`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#00ffff",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

    } else {
      // 🟣 COOP — mensaje especial
      this.add.text(W / 2, 160, "AMBOS JUGADORES GANARON", {
        fontFamily: '"Press Start 2P"',
        fontSize: 28,
        color: "#00ff88",
        stroke: "#000",
        strokeThickness: 5
      }).setOrigin(0.5);

      this.add.text(W / 2, 200, `TIME: ${tiempo}s`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#00ffff",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // ==============================
    // PANEL SCORE (CENTRADO)
    // ==============================

    this.add.rectangle(W / 2, 300, 700, 180, 0x000000, 0.8)
      .setStrokeStyle(5, 0xffff00);

    // Título tabla
    this.add.text(W / 2, 250, "HIGH SCORES", {
      fontFamily: '"Press Start 2P"',
      fontSize: 24,
      color: "#ffff00",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5);

    // ======================================
    // SI ES COOP → TEAM SCORE (como GameOver)
    // ======================================
    if (GameState.mode === "coop") {

      const teamScore = p1 + p2;

      // TEAM SCORE
      this.add.text(W / 2, 290, `TEAM SCORE: ${teamScore} DONUTS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 18,
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

      // BEST TEAM SCORE
      let best = localStorage.getItem("bestTeamScore");
      best = best ? JSON.parse(best) : { donas: 0 };

      if (teamScore > best.donas) {
        best = { donas: teamScore };
        localStorage.setItem("bestTeamScore", JSON.stringify(best));
      }

      this.add.text(W / 2, 330, `BEST TEAM SCORE: ${best.donas} DONUTS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

    } else {

      // ============================
      // VERSUS — HIGH SCORES NORMAL
      // ============================

      const jugadores = [
        { nombre: "PLAYER 1", color: "#ff66cc", donas: p1 },
        { nombre: "PLAYER 2", color: "#66ccff", donas: p2 }
      ].sort((a, b) => b.donas - a.donas);

      let y = 290;
      jugadores.forEach((p, i) => {
        const medal = i === 0 ? "🥇" : "🥈";
        const rank = i === 0 ? "1ST" : "2ND";
        
        this.add.text(W / 2 - 200, y, `${medal} ${rank}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: 18,
          color: p.color,
          stroke: "#000",
          strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(W / 2, y, p.nombre, {
          fontFamily: '"Press Start 2P"',
          fontSize: 16,
          color: "#ffffff",
          stroke: "#000",
          strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(W / 2 + 200, y, `${p.donas} DONUTS`, {
          fontFamily: '"Press Start 2P"',
          fontSize: 16,
          color: "#ffff88",
          stroke: "#000",
          strokeThickness: 2
        }).setOrigin(0.5);

        y += 40;
      });

      // WORLD BEST
      let bestRecord = localStorage.getItem("bestRecord");
      bestRecord = bestRecord ? JSON.parse(bestRecord) : { winner: "NOBODY", donas: 0 };

      const currentBest = jugadores[0].donas;
      
      if (currentBest > bestRecord.donas) {
        bestRecord = { winner, donas: currentBest };
        localStorage.setItem("bestRecord", JSON.stringify(bestRecord));

        this.add.text(W / 2, 380, "NEW WORLD RECORD!", {
          fontFamily: '"Press Start 2P"',
          fontSize: 20,
          color: "#ff0000",
          stroke: "#ffff00",
          strokeThickness: 4
        }).setOrigin(0.5);
      }

      this.add.text(W / 2, 420, `WORLD BEST: ${bestRecord.winner} - ${bestRecord.donas}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 14,
        color: "#ffaa00",
        stroke: "#8b4513",
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // ==============================
    // OPCIONES: REVANCHA / MENU
    // ==============================

    this.add.rectangle(W / 2, 520, 500, 100, 0x006600, 0.7)
      .setStrokeStyle(3, 0x00ff00);

    this.add.text(W / 2, 490, "¿CONTINUAR?", {
      fontFamily: '"Press Start 2P"',
      fontSize: 20,
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(W / 2, 525, "REVANCHA   |   MENU", {
      fontFamily: '"Press Start 2P"',
      fontSize: 16,
      color: "#ffffff",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // 🔁 INPUT
    this.input.keyboard.once("keydown-R", () => {
      GameState.player1.donasRecolectadas = 0;
      GameState.player1.lives = 3;
      GameState.player2.donasRecolectadas = 0;
      GameState.player2.lives = 3;
      GameState.sharedLives = 6;

      this.scene.stop("HUDScene");
      this.scene.start("Game");
    });

    this.input.keyboard.once("keydown-ENTER", () => {
      GameState.reset();
      this.scene.start("MainMenu");
    });
  }
}
