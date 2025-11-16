import Phaser from "phaser";
import { events } from "./GameEvents.js";
import { GameState } from "../game/state/GameState.js";
import { INPUT_ACTIONS } from "../game/utils/InputSystem.js";

export default class Combo {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.active = false;
    this.sequence = [];
    this.currentIndex = 0;

    this.delay = 1200;
    this.minDelay = 900;
    this.speedBoost = 100;
    this.timer = null;
    this.comboLength = 4;
    
    // Para detectar input del joystick
    this.inputHandler = null;
    this.currentArrow = null;
    this.joystickCooldown = false;
    this.lastStickState = { x: 0, y: 0 };
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.player.canMove = false;

    this.comboLength = Math.min(6, this.comboLength + 0);
    this.sequence = Phaser.Utils.Array.Shuffle(["left", "up", "down", "right"]).slice(
      0,
      this.comboLength
    );
    this.currentIndex = 0;
    this.showNextArrow();
  }

  showNextArrow() {
    if (this.currentIndex >= this.sequence.length) {
      this.complete();
      return;
    }

    const dir = this.sequence[this.currentIndex];
    const x = this.player.x;
    const y = this.player.y - 100;

    const imgKey = this.getArrowKey(dir);
    const arrow = this.scene.add.image(x, y - 200, imgKey).setScale(0.9).setDepth(100);
    this.currentArrow = arrow;

    this.scene.tweens.add({
      targets: arrow,
      y: y,
      duration: 800,
      ease: "Sine.easeOut",
    });

    this.expected = dir;
    this.joystickCooldown = false;
    this.lastStickState = { x: 0, y: 0 };

    // ✅ DETECCIÓN MIXTA: Teclado + Joystick
    this.setupInputDetection(arrow);
    
    // Timeout por si no presiona nada
    this.scene.time.delayedCall(1800, () => {
      if (this.active && arrow.active) this.fail(arrow);
    });
  }

  setupInputDetection(arrow) {
    // Limpiar handler anterior
    this.cleanupInputHandlers();

    // Handler para teclado (usando once para auto-remover)
    this.keyboardHandler = this.scene.input.keyboard.once("keydown", (e) => {
      this.handleKeyboardInput(e, arrow);
    });

    // Handler para joystick se maneja en update
  }

  handleKeyboardInput(event, arrow) {
    const pressed = this.mapKey(event.code);
    if (pressed && !this.joystickCooldown) {
      this.processInput(pressed, arrow);
    }
  }

  update() {
    if (!this.active || !this.expected || !this.currentArrow || this.joystickCooldown) return;

    // ✅ VERIFICAR JOYSTICK - USANDO LOS MÉTODOS EXISTENTES DEL INPUT SYSTEM
    const inputSystem = this.scene.inputSystem;
    if (!inputSystem) return;

    const playerKey = this.player.playerKey; // "player1" o "player2"
    let joystickInput = null;

    // Usar los métodos existentes del InputSystem para detección "just pressed"
    if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.LEFT, playerKey)) {
      joystickInput = "left";
    } else if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.RIGHT, playerKey)) {
      joystickInput = "right";
    } else if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.UP, playerKey)) {
      joystickInput = "up";
    } else if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.DOWN, playerKey)) {
      joystickInput = "down";
    }

    // Procesar input del joystick
    if (joystickInput && joystickInput === this.expected) {
      this.joystickCooldown = true;
      this.processInput(joystickInput, this.currentArrow);
      
      // Cooldown para evitar múltiples detecciones
      this.scene.time.delayedCall(300, () => {
        this.joystickCooldown = false;
      });
    }
  }

  processInput(pressed, arrow) {
    if (pressed === this.expected) {
      // ✅ ACIERTO
      arrow.setTint(0x00ff00);
      this.scene.tweens.add({
        targets: arrow,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          arrow.destroy();
          this.currentArrow = null;
        },
      });

      this.currentIndex++;
      this.delay = Math.max(this.delay - this.speedBoost, this.minDelay);
      
      // Limpiar input handlers antes del próximo
      this.cleanupInputHandlers();
      
      this.scene.time.delayedCall(this.delay, () => this.showNextArrow());
    } else {
      this.fail(arrow);
    }
  }

  mapKey(code) {
    const map = {
      ArrowLeft: "left",
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowRight: "right",
      KeyA: "left",
      KeyW: "up",
      KeyS: "down",
      KeyD: "right",
    };
    return map[code];
  }

  getArrowKey(dir) {
    switch (dir) {
      case "left": return "flecha1";
      case "up": return "flecha2";
      case "down": return "flecha3";
      case "right": return "flecha4";
    }
  }

  complete() {
    this.scene.audioManager.play("salud");

    // ❤️ Curar jugador
    const playerState = this.player.id === 1 ? GameState.player1 : GameState.player2;
    if (playerState.lives < 3) {
      playerState.lives++;
      events.emit("update-life", { playerID: this.player.id, vidas: playerState.lives });
    }

    // Feedback visual
    const text = this.scene.add.text(this.player.x, this.player.y - 60, "¡BUEN RITMO!", {
      fontFamily: "PixelFont",
      fontSize: 24,
      color: "#fff300",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(120);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1000,
      ease: "Sine.easeInOut",
      onComplete: () => text.destroy(),
    });

    // Liberar movimiento y limpiar
    this.scene.time.delayedCall(1200, () => {
      this.player.canMove = true;
      this.active = false;
      this.comboLength = Math.min(6, this.comboLength + 1);
      this.cleanupInputHandlers();
      this.currentArrow = null;
      this.joystickCooldown = false;
      this.lastStickState = { x: 0, y: 0 };
    });
  }

  fail(arrow) {
    arrow.setTint(0xff0000);
    this.scene.tweens.add({
      targets: arrow,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        arrow.destroy();
        this.currentArrow = null;
      },
    });

    this.delay = 1200;
    this.player.canMove = true;
    this.active = false;
    
    this.cleanupInputHandlers();
    this.joystickCooldown = false;
    this.lastStickState = { x: 0, y: 0 };
  }

  cleanupInputHandlers() {
    // Limpiar handler de teclado si existe
    if (this.keyboardHandler) {
      // No necesitamos removerlo manualmente porque usamos once()
      this.keyboardHandler = null;
    }
  }

  destroy() {
    this.cleanupInputHandlers();
    if (this.currentArrow && this.currentArrow.active) {
      this.currentArrow.destroy();
    }
  }
}