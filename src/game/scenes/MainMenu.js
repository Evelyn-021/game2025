import { Scene } from "phaser"; 
import Background from "../../classes/Background.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // === Fondo ===
    const bg = new Background(this);
    bg.create();

    // === Logo ===
    this.add.image(this.scale.width / 2, 250, "logo").setScale(0.6);

    // === Botón START GAME ===
    this.startButton = this.add
      .text(this.scale.width / 2, 560, "START GAME", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 32,
        color: "#ff3366",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // === Input System - Joystick + Teclado ===
    this.inputSystem = new InputSystem(this.input);

    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.UP]: ['W', 'UP'],
      [INPUT_ACTIONS.DOWN]: ['S', 'DOWN'],
      [INPUT_ACTIONS.LEFT]: ['A', 'LEFT'],
      [INPUT_ACTIONS.RIGHT]: ['D', 'RIGHT'],
      [INPUT_ACTIONS.NORTH]: ['ENTER', 'SPACE'],
      [INPUT_ACTIONS.SOUTH]: ['X', 'ESC'],
      [INPUT_ACTIONS.EAST]: ['E'],
      [INPUT_ACTIONS.WEST]: ['Q']
    });

    // === Eventos de mouse ===
    this.startButton.on("pointerover", () => this.highlightButton(true));
    this.startButton.on("pointerout", () => this.highlightButton(false));
    this.startButton.on("pointerdown", () => this.startGame());

    // === Texto de instrucciones ===
    this.pressText = this.add
      .text(this.scale.width / 2, 620, "Presiona A o X para comenzar", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 14,
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // === Efecto de parpadeo (blink) ===
    this.tweens.add({
      targets: this.pressText,
      alpha: { from: 1, to: 0.2 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    // Efecto inicial del botón
    this.highlightButton(true);

    console.log("🎮 MainMenu listo - Joystick y teclado configurados");
  }

  update() {
    // === Cualquier acción del joystick o teclado inicia ===
    if (
      this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.UP) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)
    ) {
      console.log("🎯 Input detectado - Iniciando juego");
      this.startGame();
    }
  }

  highlightButton(highlight) {
    if (highlight) {
      this.startButton
        .setColor("#ffffff")
        .setStroke("#ff0000", 6)
        .setScale(1.1);
    } else {
      this.startButton
        .setColor("#ff3366")
        .setStroke("#000000", 6)
        .setScale(1);
    }
  }

  startGame() {
    console.log("🚀 Iniciando CharacterSelect...");
    this.startButton.setColor("#00ff00");

    this.time.delayedCall(300, () => {
      this.scene.start("CharacterSelect");
    });
  }
}
