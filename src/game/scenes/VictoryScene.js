import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

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

    // =====================================================
    // SISTEMA DE ENTRADA
    // =====================================================
    this.inputSystem = new InputSystem(this.input);

    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.UP]: ["UP", "W"],
      [INPUT_ACTIONS.DOWN]: ["DOWN", "S"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.SOUTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.EAST]: ["ENTER"],
      [INPUT_ACTIONS.WEST]: ["ENTER"]
    });

    // 🎯 FONDO ARCOÍRIS PIXELADO
    const colors = [0xff3366, 0xff9933, 0xffff33, 0x33ff66, 0x3366ff, 0x9933ff];
    colors.forEach((color, i) => {
      this.add.rectangle(W / 2, 120 + (i * 40), W, 40, color).setAlpha(0.3);
    });

    // 🏆 TÍTULO VICTORIA
    this.add.text(W / 2, 60, "¡VICTORIA!", {
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
      this.add.text(W / 2, 140, `¡${winner.toUpperCase()} GANA!`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 28,
        color: "#ffffff",
        stroke: "#0000ff",
        strokeThickness: 5
      }).setOrigin(0.5);

    } else {
      // 🟣 COOP — mensaje especial
      this.add.text(W / 2, 140, "¡AMBOS JUGADORES GANARON!", {
        fontFamily: '"Press Start 2P"',
        fontSize: 28,
        color: "#00ff88",
        stroke: "#000",
        strokeThickness: 5
      }).setOrigin(0.5);
    }

    this.add.text(W / 2, 180, `TIEMPO: ${tiempo}s`, {
      fontFamily: '"Press Start 2P"',
      fontSize: 16,
      color: "#00ffff",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // ==============================
    // PANEL PUNTUACIÓN
    // ==============================

    this.add.rectangle(W / 2, 320, 700, 200, 0x000000, 0.8)
      .setStrokeStyle(5, 0xffff00);

    // Título tabla
    this.add.text(W / 2, 270, "PUNTUACIONES", {
      fontFamily: '"Press Start 2P"',
      fontSize: 24,
      color: "#ffff00",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5);

    // ======================================
    // SI ES COOP → PUNTUACIÓN DE EQUIPO
    // ======================================
    if (GameState.mode === "coop") {

      const teamScore = p1 + p2;
      const currentMeta = GameState.metaDonas - 5; // Meta que acaban de alcanzar
      const nextMeta = GameState.metaDonas; // Próxima meta

      // PUNTUACIÓN DEL EQUIPO
      this.add.text(W / 2, 310, `PUNTUACIÓN: ${teamScore} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 18,
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

      // META ALCANZADA
      this.add.text(W / 2, 340, `META ALCANZADA: ${currentMeta} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#00ff88",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

      // PRÓXIMA META
      this.add.text(W / 2, 370, `PRÓXIMA META: ${nextMeta} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 16,
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

      // MEJOR PUNTUACIÓN
      let best = localStorage.getItem("bestTeamScore");
      best = best ? JSON.parse(best) : { donas: 0 };

      if (teamScore > best.donas) {
        best = { donas: teamScore };
        localStorage.setItem("bestTeamScore", JSON.stringify(best));
      }

      this.add.text(W / 2, 400, `RÉCORD: ${best.donas} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 14,
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);

    } else {

      // ============================
      // VERSUS — PUNTUACIONES INDIVIDUALES
      // ============================

      const jugadores = [
        { nombre: "JUGADOR 1", color: "#ff66cc", donas: p1 },
        { nombre: "JUGADOR 2", color: "#66ccff", donas: p2 }
      ].sort((a, b) => b.donas - a.donas);

      let y = 310;
      jugadores.forEach((p, i) => {
        const medal = i === 0 ? "🥇" : "🥈";
        const rank = i === 0 ? "1RO" : "2DO";
        
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

        this.add.text(W / 2 + 200, y, `${p.donas} DONAS`, {
          fontFamily: '"Press Start 2P"',
          fontSize: 16,
          color: "#ffff88",
          stroke: "#000",
          strokeThickness: 2
        }).setOrigin(0.5);

        y += 40;
      });

      // RÉCORD MUNDIAL
      let bestRecord = localStorage.getItem("bestRecord");
      bestRecord = bestRecord ? JSON.parse(bestRecord) : { winner: "NADIE", donas: 0 };

      const currentBest = jugadores[0].donas;
      
      if (currentBest > bestRecord.donas) {
        bestRecord = { winner, donas: currentBest };
        localStorage.setItem("bestRecord", JSON.stringify(bestRecord));

        this.add.text(W / 2, 400, "¡NUEVO RÉCORD MUNDIAL!", {
          fontFamily: '"Press Start 2P"',
          fontSize: 20,
          color: "#ff0000",
          stroke: "#ffff00",
          strokeThickness: 4
        }).setOrigin(0.5);
      }

      this.add.text(W / 2, 440, `RÉCORD: ${bestRecord.winner} - ${bestRecord.donas}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: 14,
        color: "#ffaa00",
        stroke: "#8b4513",
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // ==============================
    // BOTONES INTERACTIVOS
    // ==============================

    this.add.text(W / 2, 520, "¿QUÉ QUIERES HACER?", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Crear botones
    this.buttons = [];

    // 🎮 BOTÓN SEGUIR JUGANDO - SOLO en COOP
    if (GameState.mode === "coop") {
      this.continuarButton = this.add.text(W / 2, 560, "SEGUIR JUGANDO", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#33ff33",
        stroke: "#000",
        strokeThickness: 4,
      }).setOrigin(0.5).setInteractive();
      this.buttons.push(this.continuarButton);
    }

    // 🔄 BOTÓN REVANCHA - SOLO en VERSUS
    if (GameState.mode === "versus") {
      this.revanchaButton = this.add.text(W / 2, this.buttons.length > 0 ? 600 : 560, "REVANCHA", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ff33ff",
        stroke: "#000",
        strokeThickness: 4,
      }).setOrigin(0.5).setInteractive();
      this.buttons.push(this.revanchaButton);
    }

    // 🏠 BOTÓN MENÚ PRINCIPAL - SIEMPRE disponible
    this.menuButton = this.add.text(W / 2, this.buttons.length > 0 ? (GameState.mode === "coop" ? 600 : 640) : 560, "MENÚ PRINCIPAL", {
      fontFamily: '"Press Start 2P"',
      fontSize: "24px",
      color: "#3366ff",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive();
    this.buttons.push(this.menuButton);

    this.selectedIndex = 0;
    this.updateSelection();

    // Eventos de clic
    if (GameState.mode === "coop") {
      this.continuarButton.on("pointerdown", () => this.selectContinuar());
    }
    if (GameState.mode === "versus") {
      this.revanchaButton.on("pointerdown", () => this.selectRevancha());
    }
    this.menuButton.on("pointerdown", () => this.selectMenu());
  }

  // =====================================================
  // ACTUALIZACIÓN DEL INPUT
  // =====================================================
  update() {
    this.inputSystem.update();

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.UP)) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN)) {
      this.selectedIndex = Math.min(this.buttons.length - 1, this.selectedIndex + 1);
      this.updateSelection();
    }

    if (
      this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)
    ) {
      this.confirmSelection();
    }
  }

  // =====================================================
  // SELECCIÓN DE BOTONES
  // =====================================================
  updateSelection() {
    this.buttons.forEach((btn, index) => {
      this.tweens.killTweensOf(btn);

      if (index === this.selectedIndex) {
        btn.setColor("#ffffff")
          .setStroke("#ffff00", 5)
          .setScale(1.1);

        this.tweens.add({
          targets: btn,
          scale: 1.15,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      } else {
        btn.setScale(1).setStroke("#000", 3);
        // Restaurar colores originales según el modo y posición
        if (GameState.mode === "coop") {
          if (index === 0) btn.setColor("#33ff33"); // Seguir Jugando
          else btn.setColor("#3366ff"); // Menú
        } else {
          if (index === 0) btn.setColor("#ff33ff"); // Revancha
          else btn.setColor("#3366ff"); // Menú
        }
      }
    });
  }

  confirmSelection() {
    if (GameState.mode === "coop") {
      if (this.selectedIndex === 0) this.selectContinuar();
      else this.selectMenu();
    } else {
      if (this.selectedIndex === 0) this.selectRevancha();
      else this.selectMenu();
    }
  }

  // =====================================================
  // ACCIONES DE BOTONES
  // =====================================================
  selectContinuar() {
    // 🔥 MANTENER las donas recolectadas y continuar con la nueva meta
    GameState.player1.donasRecolectadas = this.data.p1;
    GameState.player2.donasRecolectadas = this.data.p2;
    
    this.scene.stop("HUDScene");
    this.scene.start("Game");
  }

  selectRevancha() {
    // Reset parcial para VERSUS
    GameState.player1.donasRecolectadas = 0;
    GameState.player1.lives = 3;
    GameState.player2.donasRecolectadas = 0;
    GameState.player2.lives = 3;

    this.scene.stop("HUDScene");
    this.scene.start("Game");
  }

  selectMenu() {
    GameState.reset();
    this.scene.start("MainMenu");
  }
}