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
    this.cameras.main.setBackgroundColor("#1a1a2e");
    
    const { winner, p1 = 0, p2 = 0, tiempo = 0, motivo } = this.dataFin;

    // 🎯 FONDO PIXELADO
    this.add.rectangle(512, 384, 1024, 768, 0x2d1b69).setAlpha(0.8);
    
    // 🕹️ TÍTULO PRINCIPAL - Estilo Arcade
    this.add.text(512, 100, "GAME OVER", {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 48,
      color: "#ff3366",
      stroke: "#000000",
      strokeThickness: 6,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000',
        blur: 0,
        fill: true
      }
    }).setOrigin(0.5);

    // 🏆 GANADOR - Estilo Pixel
    this.add.text(512, 180, `${winner.toUpperCase()} WINS!`, {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 24,
      color: "#ffff00",
      stroke: "#8b4513",
      strokeThickness: 4
    }).setOrigin(0.5);

    // 💀 MOTIVO DE DERROTA
    if (motivo === "sin vidas") {
      this.add.text(512, 220, "OUT OF LIVES!", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 18,
        color: "#ff5555",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // 📊 PUNTUACIONES - Estilo Tabla Arcade
    this.add.rectangle(512, 300, 600, 120, 0x000000, 0.6)
      .setStrokeStyle(4, 0x00ffff);
    
    this.add.text(512, 270, "FINAL SCORE", {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 20,
      color: "#00ffff",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // 🍩 DONAS RECOLECTADAS
    this.add.text(350, 300, `P1: ${p1} DONUTS`, {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 16,
      color: "#ff66cc",
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(674, 300, `P2: ${p2} DONUTS`, {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 16,
      color: "#66ccff", 
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5);

    // ⏱️ TIEMPO
    this.add.text(512, 330, `TIME: ${tiempo}s`, {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 14,
      color: "#ffff88",
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5);

    // 🥇 RÉCORD
    const best = JSON.parse(localStorage.getItem("bestRecord")) || { winner: "NOBODY", donas: 0 };
    const ganadorDonas = winner === "Jugador 1" ? p1 : p2;

    if (ganadorDonas > best.donas) {
      localStorage.setItem("bestRecord", JSON.stringify({ winner, donas: ganadorDonas }));
    }
    const updated = JSON.parse(localStorage.getItem("bestRecord"));

    this.add.text(512, 380, `BEST: ${updated.winner} - ${updated.donas} DONUTS`, {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 14,
      color: "#ffaa00",
      stroke: "#8b4513",
      strokeThickness: 3
    }).setOrigin(0.5);

    // 🎮 BOTONES - Estilo Arcade
    this.add.rectangle(512, 480, 400, 150, 0x000000, 0.7)
      .setStrokeStyle(3, 0x00ff00);

    this.add.text(512, 440, "CONTINUE?", {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 20,
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // === BOTÓN "REVANCHA" ===
    this.revanchaButton = this.add.text(512, 480, 'REMATCH', {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 24,
      color: '#ff33ffff',
      stroke: '#000000ff',
      strokeThickness: 4,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // === BOTÓN "MENÚ" ===
    this.menuButton = this.add.text(512, 520, 'MAIN MENU', {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 20,
      color: '#3366ff',
      stroke: '#000000',
      strokeThickness: 3,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 🎯 SISTEMA DE SELECCIÓN CON TECLADO
    this.selectedIndex = 0;
    this.buttons = [this.revanchaButton, this.menuButton];
    this.updateSelection();

    // ⌨️ CONFIGURAR TECLAS
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 🎪 EFECTOS HOVER BOTÓN REVANCHA (Mouse)
    this.revanchaButton.on('pointerover', () => {
      this.selectedIndex = 0;
      this.updateSelection();
    });

    this.revanchaButton.on('pointerout', () => {
      // No hacer nada para mantener la selección del teclado
    });

    this.revanchaButton.on('pointerdown', () => {
      this.selectRevancha();
    });

    // 🎪 EFECTOS HOVER BOTÓN MENÚ (Mouse)
    this.menuButton.on('pointerover', () => {
      this.selectedIndex = 1;
      this.updateSelection();
    });

    this.menuButton.on('pointerout', () => {
      // No hacer nada para mantener la selección del teclado
    });

    this.menuButton.on('pointerdown', () => {
      this.selectMenu();
    });

    // ✨ TEXTO INFORMATIVO
    this.add.text(512, 580, 'USE ARROWS + ENTER OR MOUSE TO SELECT', {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: 10,
      color: '#ffff88',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // 🔊 SONIDO DE NAVEGACIÓN (si tienes audio)
    // this.selectSound = this.sound.add('select', { volume: 0.3 });
    // this.confirmSound = this.sound.add('confirm', { volume: 0.5 });
  }

  update() {
    // ⌨️ NAVEGACIÓN CON TECLADO
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
      // if (this.selectSound) this.selectSound.play();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedIndex = Math.min(this.buttons.length - 1, this.selectedIndex + 1);
      this.updateSelection();
      // if (this.selectSound) this.selectSound.play();
    }

    // ✅ CONFIRMAR SELECCIÓN
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.confirmSelection();
      // if (this.confirmSound) this.confirmSound.play();
    }
  }

  updateSelection() {
    // 🎨 ACTUALIZAR APARIENCIA DE BOTONES SEGÚN SELECCIÓN
    this.buttons.forEach((button, index) => {
      if (index === this.selectedIndex) {
        // 🟡 BOTÓN SELECCIONADO
        button.setColor('#ffffff')
              .setStroke('#ffff00', 5)
              .setScale(1.1);
        
        // Efecto de brillo
        this.tweens.add({
          targets: button,
          scale: 1.15,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      } else {
        // ⚫ BOTÓN NO SELECCIONADO
        button.setColor(index === 0 ? '#ff3366' : '#3366ff')
              .setStroke('#000000', index === 0 ? 4 : 3)
              .setScale(1);
              
        // Detener cualquier animación anterior
        this.tweens.killTweensOf(button);
      }
    });
  }

  confirmSelection() {
    switch (this.selectedIndex) {
      case 0: // REVANCHA
        this.selectRevancha();
        break;
      case 1: // MENÚ
        this.selectMenu();
        break;
    }
  }

  selectRevancha() {
    // Efecto visual de confirmación
    this.tweens.add({
      targets: this.revanchaButton,
      scale: 0.9,
      duration: 100,
      yoyo: true
    });

    // Acción después de delay
    this.time.delayedCall(150, () => {
      console.log("🔄 Iniciando revancha...");
      GameState.player1.donasRecolectadas = 0;
      GameState.player1.lives = 3;
      GameState.player2.donasRecolectadas = 0;
      GameState.player2.lives = 3;
      
      this.scene.stop("HUDScene");
      this.scene.start("Game");
    });
  }

  selectMenu() {
    // Efecto visual de confirmación
    this.tweens.add({
      targets: this.menuButton,
      scale: 0.9,
      duration: 100,
      yoyo: true
    });

    // Acción después de delay
    this.time.delayedCall(150, () => {
      console.log("🏠 Yendo al menú principal...");
      GameState.reset();
      this.scene.start("MainMenu");
    });
  }

  // 🧹 LIMPIAR AL SALIR
  shutdown() {
    if (this.cursors) {
      this.cursors.up.off();
      this.cursors.down.off();
    }
    if (this.enterKey) this.enterKey.off();
    if (this.spaceKey) this.spaceKey.off();
  }
}