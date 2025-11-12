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

    // === Botón único ===
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

    // === Input System - CON JOYSTICK ===
    this.inputSystem = new InputSystem(this.input);
    
    // Configurar teclado Y joystick
    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.UP]: ['W', 'UP'],        // Joystick arriba
      [INPUT_ACTIONS.DOWN]: ['S', 'DOWN'],    // Joystick abajo  
      [INPUT_ACTIONS.LEFT]: ['A', 'LEFT'],    // Joystick izquierda
      [INPUT_ACTIONS.RIGHT]: ['D', 'RIGHT'],  // Joystick derecha
      [INPUT_ACTIONS.NORTH]: ['ENTER', 'SPACE'], // Botón norte gamepad
      [INPUT_ACTIONS.SOUTH]: ['X', 'ESC'],       // Botón sur gamepad
      [INPUT_ACTIONS.EAST]: ['E'],             // Botón este gamepad
      [INPUT_ACTIONS.WEST]: ['Q']              // Botón oeste gamepad
    });

    // === Eventos de mouse ===
    this.startButton.on("pointerover", () => this.highlightButton(true));
    this.startButton.on("pointerout", () => this.highlightButton(false));
    this.startButton.on("pointerdown", () => this.startGame());

    // === Instrucciones ACTUALIZADAS ===
    this.add
      .text(this.scale.width / 2, 620, "PRESS ANY BUTTON OR USE JOYSTICK TO START", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 14,
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Efecto inicial
    this.highlightButton(true);
    
    console.log("🎮 MainMenu listo - Joystick y teclado configurados");
  }

  update() {
    // ✅ DETECCIÓN COMPLETA - CUALQUIER BOTÓN O DIRECCIÓN DEL JOYSTICK
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) || 
        this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.UP) ||     // Joystick arriba
        this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN) ||   // Joystick abajo
        this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT) ||   // Joystick izquierda  
        this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)) {  // Joystick derecha
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