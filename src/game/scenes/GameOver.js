import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

// ⭐ TRADUCILA
import { getTranslations, getPhrase } from "../../services/translations";
import { ES, EN, PT } from "../../enums/languages";

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
    // TÍTULO — GAME OVER
    // =====================================================
    this.add.text(W / 2, H * 0.10, getPhrase("¡FIN DEL JUEGO!"), {
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
      let winnerMessage = "";

      if (winner === "Jugador 1") {
        winnerMessage = getPhrase("¡JUGADOR 1 GANA!");
      } else if (winner === "Jugador 2") {
        winnerMessage = getPhrase("¡JUGADOR 2 GANA!");
      }

      this.add.text(W / 2, H * 0.19, winnerMessage, {
        fontFamily: '"Press Start 2P"',
        fontSize: "22px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 4,
      }).setOrigin(0.5);
    }

    if (GameState.mode === "coop") {
      this.add.text(W / 2, H * 0.19, getPhrase("AMBOS JUGADORES PERDIERON"), {
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

    this.add.text(W / 2, H * 0.320, getPhrase("PUNTAJE FINAL"), {
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

      // ⭐ TEXTO CORRECTAMENTE TRADUCIDO
      const teamScoreText =
        `${getPhrase("PUNTAJE DE EQUIPO:")} ${teamScore} ${getPhrase("DONAS")}`;

      this.add.text(W / 2, H * 0.40, teamScoreText, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      let best = localStorage.getItem("bestTeamScore");
      best = best ? JSON.parse(best) : { donas: 0 };

      if (teamScore > best.donas) {
        best = { donas: teamScore };
        localStorage.setItem("bestTeamScore", JSON.stringify(best));
      }

      const bestTeamText =
        `${getPhrase("MEJOR PUNTAJE DE EQUIPO")}: ${best.donas} ${getPhrase("DONAS")}`;

      this.add.text(W / 2, H * 0.435, bestTeamText, {
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

      const p1Text =
        `${getPhrase("P1")}: ${p1} ${getPhrase("DONAS")}`;

      this.add.text(W * 0.33, H * 0.40, p1Text, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      const p2Text =
        `${getPhrase("P2")}: ${p2} ${getPhrase("DONAS")}`;

      this.add.text(W * 0.67, H * 0.40, p2Text, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#66ccff",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      const timeText =
        `${getPhrase("TIEMPO:")} ${tiempo}s`;

      this.add.text(W / 2, H * 0.435, timeText, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#ffff88",
        stroke: "#000",
        strokeThickness: 2,
      }).setOrigin(0.5);

      // =====================================================
      // MEJOR — BEST RECORD
      // =====================================================

      let best = localStorage.getItem("bestRecord");
      best = best ? JSON.parse(best) : { winner: "NOBODY", donas: 0 };

      const ganadorDonas = winner === "Jugador 1" ? p1 : p2;

      if (ganadorDonas > best.donas) {
        best = { winner, donas: ganadorDonas };
        localStorage.setItem("bestRecord", JSON.stringify(best));
      }

      const bestWinnerText =
        `${getPhrase("MEJOR:")} ${getPhrase(best.winner.toUpperCase())} - ${best.donas} ${getPhrase("DONAS")}`;

      this.add.text(W / 2, H * 0.50, bestWinnerText, {
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

    this.add.text(W / 2, H * 0.62, getPhrase("¿CONTINUAR?"), {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // =====================================================
    // BOTONES
    // =====================================================

    this.revanchaButton = this.add.text(W / 2, H * 0.68, getPhrase("REVANCHA"), {
      fontFamily: '"Press Start 2P"',
      fontSize: "24px",
      color: "#ff33ff",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive();

    this.menuButton = this.add.text(W / 2, H * 0.73, getPhrase("MENU"), {
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

  selectRevancha() {
    this.scene.stop("HUDScene");

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
