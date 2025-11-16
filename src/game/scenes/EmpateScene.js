import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class EmpateScene extends Scene {
  constructor() {
    super("EmpateScene");
  }

  create(data) {
    const { p1 = 0, p2 = 0, tiempo = 0 } = data;

    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.setBackgroundColor("#1a1a2e");

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

    // === FONDO COMPLETO ===
    this.add.rectangle(W / 2, H / 2, W, H, 0x2d1b69, 0.85);

    // === TÍTULO ===
    this.add.text(W / 2, H * 0.10, "EMPATE", {
      fontFamily: '"Press Start 2P"',
      fontSize: "48px",
      color: "#ffcc00",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    // === MENSAJE ===
    this.add.text(W / 2, H * 0.18, "AMBOS JUGADORES EMPATAN", {
      fontFamily: '"Press Start 2P"',
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // === MARCO PUNTOS ===
    this.add.rectangle(W / 2, H * 0.38, W * 0.60, 150, 0x000000, 0.55)
      .setStrokeStyle(4, 0xffff00);

    this.add.text(W / 2, H * 0.325, "SCORES", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#ffff00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // === PUNTAJES ===
    this.add.text(W * 0.33, H * 0.38, `P1: ${p1} DONUTS`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#ff66cc",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(W * 0.67, H * 0.38, `P2: ${p2} DONUTS`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#66ccff",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    // === TIEMPO ===
    this.add.text(W / 2, H * 0.435, `TIME: ${tiempo}s`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "14px",
      color: "#ffff88",
      stroke: "#000",
      strokeThickness: 2,
    }).setOrigin(0.5);

    // === CONTENEDOR BOTONES ===
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
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive();

    this.menuButton = this.add.text(W / 2, H * 0.73, "MENU", {
      fontFamily: '"Press Start 2P"',
      fontSize: "18px",
      color: "#3366ff",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive();

    this.buttons = [this.revanchaButton, this.menuButton];
    this.selectedIndex = 0;

    this.updateSelection();

    // === CLICK CON MOUSE ===
    this.revanchaButton.on("pointerdown", () => this.selectRevancha());
    this.menuButton.on("pointerdown", () => this.selectMenu());
  }

  update() {
    // === Inputs del InputSystem ===
    this.inputSystem.update();

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.UP)) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN)) {
      this.selectedIndex = Math.min(this.buttons.length - 1, this.selectedIndex + 1);
      this.updateSelection();
    }

    // Confirmar con cualquier botón del joystick
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
