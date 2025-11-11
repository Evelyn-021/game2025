import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class VictoryScene extends Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data) {
    const { winner, p1 = 0, p2 = 0, tiempo = 0 } = data;

    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // 🎯 FONDO ARCOÍRIS PIXELADO
    const colors = [0xff3366, 0xff9933, 0xffff33, 0x33ff66, 0x3366ff, 0x9933ff];
    colors.forEach((color, i) => {
      this.add.rectangle(512, 150 + (i * 40), 1024, 40, color).setAlpha(0.3);
    });

    // 🏆 TÍTULO VICTORIA - Estilo Neon
    this.add.text(512, 80, "VICTORY!", {
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

    // 👑 GANADOR
    this.add.text(512, 160, `${winner.toUpperCase()} WINS!`, {
      fontFamily: '"Press Start 2P"',
      fontSize: 28,
      color: "#ffffff",
      stroke: "#0000ff",
      strokeThickness: 5
    }).setOrigin(0.5);

    // ⏱️ TIEMPO
    this.add.text(512, 200, `TIME: ${tiempo}s`, {
      fontFamily: '"Press Start 2P"',
      fontSize: 16,
      color: "#00ffff",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // 📊 TABLA DE PUNTUACIONES - Estilo Arcade
    this.add.rectangle(512, 300, 700, 180, 0x000000, 0.8)
      .setStrokeStyle(5, 0xffff00);

    this.add.text(512, 250, "HIGH SCORES", {
      fontFamily: '"Press Start 2P"',
      fontSize: 24,
      color: "#ffff00",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5);

    const jugadores = [
      { nombre: "PLAYER 1", color: "#ff66cc", donas: p1 },
      { nombre: "PLAYER 2", color: "#66ccff", donas: p2 }
    ].sort((a, b) => b.donas - a.donas);

    let y = 290;
    jugadores.forEach((p, i) => {
      const medal = i === 0 ? "🥇" : "🥈";
      const rank = i === 0 ? "1ST" : "2ND";
      
      this.add.text(300, y, `${medal} ${rank}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 18,
        color: p.color,
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0, 0.5);

      this.add.text(450, y, p.nombre, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0, 0.5);

      this.add.text(650, y, `${p.donas} DONUTS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#ffff88",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0, 0.5);

      y += 40;
    });

    // 🥇 RÉCORD MUNDIAL
    const bestRecord = JSON.parse(localStorage.getItem("bestRecord")) || { winner: "NOBODY", donas: 0 };
    const currentBest = jugadores[0].donas;
    
    if (currentBest > bestRecord.donas) {
      localStorage.setItem("bestRecord", JSON.stringify({ winner, donas: currentBest }));
      // ✨ EFECTO NUEVO RÉCORD
      this.add.text(512, 380, "NEW WORLD RECORD!", {
        fontFamily: '"Press Start 2P"',
        fontSize: 20,
        color: "#ff0000",
        stroke: "#ffff00",
        strokeThickness: 4
      }).setOrigin(0.5);
    }
    
    const updatedBest = JSON.parse(localStorage.getItem("bestRecord"));
    
    this.add.text(512, 420, `WORLD BEST: ${updatedBest.winner} - ${updatedBest.donas}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: 14,
      color: "#ffaa00",
      stroke: "#8b4513",
      strokeThickness: 3
    }).setOrigin(0.5);

    // 🎮 CONTROLES
    this.add.rectangle(512, 520, 500, 60, 0x006600, 0.7)
      .setStrokeStyle(3, 0x00ff00);

    this.add.text(512, 500, "CONTROLS", {
      fontFamily: '"Press Start 2P"',
      fontSize: 16,
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(512, 530, "R - PLAY AGAIN    ENTER - QUIT", {
      fontFamily: '"Press Start 2P"',
      fontSize: 12,
      color: "#ffffff",
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5);

    // ✨ TEXTO PARPADEANTE estilo Arcade
    const flashText = this.add.text(512, 600, "INSERT COIN TO CONTINUE", {
      fontFamily: '"Press Start 2P"',
      fontSize: 16,
      color: "#ffff00",
      stroke: "#ff6600",
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: flashText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 🔁 EVENTOS DE ENTRADA
    this.input.keyboard.once("keydown-R", () => {
      GameState.player1.donasRecolectadas = 0;
      GameState.player1.lives = 3;
      GameState.player2.donasRecolectadas = 0;
      GameState.player2.lives = 3;
      
      this.scene.stop("HUDScene");
      this.scene.start("Game");
    });

    this.input.keyboard.once("keydown-ENTER", () => {
      GameState.reset();
      this.scene.start("MainMenu");
    });
  }
}