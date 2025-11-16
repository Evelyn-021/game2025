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

    const { winner, p1 = 0, p2 = 0, tiempo = 0, motivo } = this.dataFin;

    // === SISTEMA DE ENTRADA ===
    this.inputSystem = new InputSystem(this.input);

    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.UP]: ["UP", "W"],
      [INPUT_ACTIONS.DOWN]: ["DOWN", "S"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.SOUTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.EAST]: ["ENTER"],
      [INPUT_ACTIONS.WEST]: ["ENTER"]
    });

    // === FONDO FULL ===
    this.add
      .rectangle(W / 2, H / 2, W, H, 0x2d1b69)
      .setAlpha(0.85);

    // === TÍTULO ===
    this.add.text(W / 2, H * 0.10, "GAME OVER", {
      fontFamily: '"Press Start 2P"',
      fontSize: "48px",
      color: "#ff3366",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    // === GANADOR ===
    this.add.text(W / 2, H * 0.19, `${winner.toUpperCase()} WINS!`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "22px",
      color: "#ffff00",
      stroke: "#000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    if (motivo === "sin vidas") {
      this.add.text(W / 2, H * 0.24, "OUT OF LIVES!", {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#ff6666",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // === PUNTAJE ===
    this.add.rectangle(W / 2, H * 0.40, W * 0.60, 120, 0x000000, 0.55)
      .setStrokeStyle(4, 0x00ffff);

    this.add.text(W / 2, H * 0.355, "FINAL SCORE", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#00ffff",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(W * 0.33, H * 0.40, `P1: ${p1} DONUTS`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#ff66cc",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(W * 0.67, H * 0.40, `P2: ${p2} DONUTS`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#66ccff",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.435, `TIME: ${tiempo}s`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "14px",
      color: "#ffff88",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    // === RECORD ===
    const best = JSON.parse(localStorage.getItem("bestRecord")) || {
      winner: "NOBODY",
      donas: 0
    };
    const ganadorDonas = winner === "Jugador 1" ? p1 : p2;

    if (ganadorDonas > best.donas) {
      localStorage.setItem("bestRecord", JSON.stringify({ winner, donas: ganadorDonas }));
    }
    const updated = JSON.parse(localStorage.getItem("bestRecord"));

    this.add.text(W / 2, H * 0.50, `BEST: ${updated.winner} - ${updated.donas} DONUTS`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "14px",
      color: "#ffaa00",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    // === CONTINUE ===
    this.add.rectangle(W / 2, H * 0.68, 400, 150, 0x000000, 0.65)
      .setStrokeStyle(3, 0x00ff00);

    this.add.text(W / 2, H * 0.62, "¿CONTINUAR?", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // === BOTONES ===
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

    // Click
    this.revanchaButton.on("pointerdown", () => this.selectRevancha());
    this.menuButton.on("pointerdown", () => this.selectMenu());
  }

  update() {

    // === ACTUALIZAR INPUTSYSTEM ===
    this.inputSystem.update();

    // === TECLAS Y JOYSTICK (UP/DOWN) ===
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.UP)) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN)) {
      this.selectedIndex = Math.min(this.buttons.length - 1, this.selectedIndex + 1);
      this.updateSelection();
    }

    // === CONFIRMAR CON CUALQUIER BOTÓN DEL JOYSTICK ===
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
        btn.setScale(1)
          .setStroke("#000", 3);

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
    GameState.player1.lives = 3;
    GameState.player2.lives = 3;
    GameState.player1.donasRecolectadas = 0;
    GameState.player2.donasRecolectadas = 0;
    this.scene.start("Game");
  }

  selectMenu() {
    GameState.reset();
    this.scene.start("MainMenu");
  }
}
