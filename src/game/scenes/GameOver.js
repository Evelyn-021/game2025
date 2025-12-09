import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  init(data) {
    this.dataFin = data;
  }

  create() {

    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.setBackgroundColor("#1a1a2e");

    const { winner, p1 = 0, p2 = 0, tiempo = 0 } = this.dataFin;

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

    // =====================================================
    // FONDO
    // =====================================================
    this.add.rectangle(W / 2, H / 2, W, H, 0x2d1b69).setAlpha(0.85);

    // =====================================================
    // TÍTULO
    // =====================================================
    this.add.text(W / 2, H * 0.10, "¡FIN DEL JUEGO!", {
      fontFamily: '"Press Start 2P"',
      fontSize: "48px",
      color: "#ff3366",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    // =====================================================
    // MENSAJE SEGÚN MODO
    // =====================================================

    if (GameState.mode === "versus") {
      this.add.text(W / 2, H * 0.19, `${winner.toUpperCase()} GANA!`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "22px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 4,
      }).setOrigin(0.5);
    }

    if (GameState.mode === "coop") {
      this.add.text(W / 2, H * 0.19, "AMBOS JUGADORES PERDIERON", {
        fontFamily: '"Press Start 2P"',
        fontSize: "22px",
        color: "#ff6666",
        stroke: "#000",
        strokeThickness: 4,
      }).setOrigin(0.5);
    }

    // =====================================================
    // PANEL — FINAL SCORE
    // =====================================================

    this.add.rectangle(W / 2, H * 0.40, W * 0.60, 150, 0x000000, 0.55)
      .setStrokeStyle(4, 0x00ffff);

    this.add.text(W / 2, H * 0.355, "PUNTAJE FINAL", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#00ffff",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // =====================================================
    // COOP — TEAM SCORE
    // =====================================================
    if (GameState.mode === "coop") {

      const teamScore = p1 + p2;

      // TEAM SCORE
      this.add.text(W / 2, H * 0.40, `PUNTAJE DE EQUIPO: ${teamScore} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      // BEST TEAM SCORE (seguro)
      let best = localStorage.getItem("bestTeamScore");
      best = best ? JSON.parse(best) : { donas: 0 };

      if (teamScore > best.donas) {
        best = { donas: teamScore };
        localStorage.setItem("bestTeamScore", JSON.stringify(best));
      }

      this.add.text(W / 2, H * 0.435, `MEJOR PUNTAJE DE EQUIPO: ${best.donas} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

    } else {

      // =====================================================
      // VERSUS — SCORE INDIVIDUAL
      // =====================================================

      this.add.text(W * 0.33, H * 0.40, `P1: ${p1} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.add.text(W * 0.67, H * 0.40, `P2: ${p2} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#66ccff",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      this.add.text(W / 2, H * 0.435, `TIEMPO: ${tiempo}s`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#ffff88",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      // BEST RECORD VERSUS
      let best = localStorage.getItem("bestRecord");
      best = best ? JSON.parse(best) : { winner: "NOBODY", donas: 0 };

      const ganadorDonas = winner === "Jugador 1" ? p1 : p2;

      if (ganadorDonas > best.donas) {
        best = { winner, donas: ganadorDonas };
        localStorage.setItem("bestRecord", JSON.stringify(best));
      }

      this.add.text(W / 2, H * 0.50, `MEJOR: ${best.winner} - ${best.donas} DONAS`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // =====================================================
    // CONTINUAR
    // =====================================================

    this.add.rectangle(W / 2, H * 0.68, 400, 150, 0x000000, 0.65)
      .setStrokeStyle(3, 0x00ff00);

    this.add.text(W / 2, H * 0.62, "¿CONTINUAR?", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // =====================================================
    // BOTONES
    // =====================================================

    this.revanchaButton = this.add.text(W / 2, H * 0.68, "REVANCHA", {
      fontFamily: '"Press Start 2P"',
      fontSize: "24px",
      color: "#ff33ff",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive();

    this.menuButton = this.add.text(W / 2, H * 0.73, "MENU", {
      fontFamily: '"Press Start 2P"',
      fontSize: "18px",
      color: "#3366ff",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive();

    this.buttons = [this.revanchaButton, this.menuButton];
    this.selectedIndex = 0;
    this.updateSelection();

    this.revanchaButton.on("pointerdown", () => this.selectRevancha());
    this.menuButton.on("pointerdown", () => this.selectMenu());
  }

  // =====================================================
  // INPUT
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
        btn.setColor(index === 0 ? "#ff33ff" : "#3366ff");
      }
    });
  }

  confirmSelection() {
    if (this.selectedIndex === 0) this.selectRevancha();
    else this.selectMenu();
  }

  // =====================================================
  // ACCIONES DE BOTONES
  // =====================================================
  selectRevancha() {
    this.scene.stop("HUDScene");

    // Reset parcial
    GameState.player1.donasRecolectadas = 0;
    GameState.player2.donasRecolectadas = 0;

    GameState.player1.lives = 3;
    GameState.player2.lives = 3;
    GameState.sharedLives = 6;

    this.scene.start("Game");
  }

  selectMenu() {
    GameState.reset();
    this.scene.start("MainMenu");
  }
}
