import Phaser from "phaser";
import { events } from "./GameEvents.js";
import { GameState } from "../game/state/GameState.js";
import { INPUT_ACTIONS } from "../game/utils/InputSystem.js";
import { getTranslations, getPhrase } from "../services/translations";
import { ES, EN, PT } from "../enums/languages.js";

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
    
    // Para detectar input del D-Pad
    this.inputHandler = null;
    this.currentArrow = null;
    this.dpadCooldown = false;
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

  // ===============================
  // 📌 NUEVA POSICIÓN FIJA POR JUGADOR
  // ===============================
  const cam = this.scene.cameras.main;
  const cx = cam.scrollX + cam.width / 2;
  const cy = cam.scrollY + cam.height / 2;

  let x, y;

  // Player 1 → izquierda
  if (this.player.id === 1) {
    x = cx - cam.width * 0.28;
    y = cy - cam.height * 0.25;
  }
  // Player 2 → derecha
  else {
    x = cx + cam.width * 0.28;
    y = cy - cam.height * 0.25;
  }

  // ===============================
  // 📌 CREACIÓN DE LA FLECHA
  // ===============================
  const imgKey = this.getArrowKey(dir);

  const arrow = this.scene.add
    .image(x, y - 80, imgKey)
    .setScale(0.9)
    .setDepth(100);

  this.currentArrow = arrow;

  this.scene.tweens.add({
    targets: arrow,
    y: y,
    duration: 800,
    ease: "Sine.easeOut",
  });

  this.expected = dir;
  this.dpadCooldown = false;

  // Detección de teclado + gamepad
  this.setupInputDetection(arrow);

  // Timeout si no toca nada
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

    // Handler para D-Pad se maneja en update
  }

  handleKeyboardInput(event, arrow) {
    const pressed = this.mapKey(event.code);
    if (pressed && !this.dpadCooldown) {
      this.processInput(pressed, arrow);
    }
  }

 update() {
  if (!this.active || !this.expected || !this.currentArrow || this.dpadCooldown) return;

  const inputSystem = this.scene.inputSystem;
  if (!inputSystem) return;

  const playerKey = this.player.playerKey; 
  let detectedInput = null;

  // === DETECCIÓN D-PAD USANDO INPUT SYSTEM ===
  if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.LEFT, playerKey)) {
    detectedInput = "left";
  } else if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.RIGHT, playerKey)) {
    detectedInput = "right";
  } else if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.UP, playerKey)) {
    detectedInput = "up";
  } else if (inputSystem.isGamepadJustPressed(INPUT_ACTIONS.DOWN, playerKey)) {
    detectedInput = "down";
  }

  // === SI HIZO LA ENTRADA CORRECTA ===
  if (detectedInput && detectedInput === this.expected) {
    this.dpadCooldown = true;
    this.processInput(detectedInput, this.currentArrow);

    // Evita doble detección
    this.scene.time.delayedCall(200, () => {
      this.dpadCooldown = false;
    });
  }

  // (Opcional) DEBUG del D-Pad
  // this.debugDpadState(playerKey);
}

  // ✅ NUEVO MÉTODO: Debug del estado del D-Pad
  debugDpadState(playerKey) {
    // Solo activar debug si es necesario
    if (!this.scene.config || !this.scene.config.debugCombo) return;

    const inputSystem = this.scene.inputSystem;
    const gamepad = playerKey === "player1" ? inputSystem.gamepad1 : inputSystem.gamepad2;
    
    if (!gamepad) return;

    // Verificar estado de los botones del D-Pad (12-15)
    const dpadStates = {
      "DPAD_UP (12)": gamepad.buttons[12]?.pressed || false,
      "DPAD_DOWN (13)": gamepad.buttons[13]?.pressed || false,
      "DPAD_LEFT (14)": gamepad.buttons[14]?.pressed || false,
      "DPAD_RIGHT (15)": gamepad.buttons[15]?.pressed || false,
    };

    // Solo mostrar si algún botón está presionado
    const pressedButtons = Object.keys(dpadStates).filter(key => dpadStates[key]);
    if (pressedButtons.length > 0) {
      console.log(`🎮 D-Pad ${playerKey} presionado:`, pressedButtons, "Expected:", this.expected);
    }
  }
getUnifiedDirection() {
  const input = this.scene.inputSystem;
  const playerKey = this.player.playerKey;

  // 1) DPAD (just pressed)
  if (input.isGamepadJustPressed(INPUT_ACTIONS.LEFT, playerKey)) return "left";
  if (input.isGamepadJustPressed(INPUT_ACTIONS.RIGHT, playerKey)) return "right";
  if (input.isGamepadJustPressed(INPUT_ACTIONS.UP, playerKey)) return "up";
  if (input.isGamepadJustPressed(INPUT_ACTIONS.DOWN, playerKey)) return "down";

  // 2) ANALÓGICO
  const pad = playerKey === "player1" ? input.gamepad1 : input.gamepad2;
  if (pad) {
    const x = pad.axes[0]?.getValue() || 0;
    const y = pad.axes[1]?.getValue() || 0;

    if (x < -0.5) return "left";
    if (x > 0.5) return "right";
    if (y < -0.5) return "up";
    if (y > 0.5) return "down";
  }

  // 3) TECLADO (ya lo manejás así)
  return null;
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
      
      // Feedback de acierto
      this.showHitFeedback(getPhrase("¡BIEN!"));

      
      // Limpiar input handlers antes del próximo
      this.cleanupInputHandlers();
      
      this.scene.time.delayedCall(this.delay, () => this.showNextArrow());
    } else {
      this.fail(arrow);
    }
  }

  // ✅ MÉTODO: Feedback visual mejorado
  showHitFeedback(text) {

  // === CENTRO DE CÁMARA ===
  const cam = this.scene.cameras.main;
  const cx = cam.scrollX + cam.width / 2;
  const cy = cam.scrollY + cam.height / 2;

  // === POSICIÓN FIJA POR JUGADOR ===
  let x = (this.player.id === 1)
    ? cx - cam.width * 0.28
    : cx + cam.width * 0.28;

  let y = cy - cam.height * 0.32;

  const feedback = this.scene.add.text(x, y, text, {
    fontFamily: "PixelFont",
    fontSize: 22,
    color: text === "¡FALLO!" ? "#ff3333" : "#33ff33",
    stroke: "#000000",
    strokeThickness: 3,
  })
    .setOrigin(0.5)
    .setDepth(120);

  this.scene.tweens.add({
    targets: feedback,
    y: y - 25,
    alpha: 0,
    duration: 500,
    ease: "Sine.easeOut",
    onComplete: () => feedback.destroy(),
  });
}


  mapKey(code) {
    const map = {
      // Flechas
      ArrowLeft: "left",
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowRight: "right",
      // WASD
      KeyA: "left",
      KeyW: "up",
      KeyS: "down",
      KeyD: "right",
      // Numpad (para jugador 2)
      Numpad4: "left",
      Numpad8: "up",
      Numpad5: "down",
      Numpad6: "right",
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

    // ============================
    // ❤️ COOP → CURA VIDA COMPARTIDA
    // ============================
    if (GameState.mode === "coop") {
        if (GameState.sharedLives < 6) {
            GameState.sharedLives++;

            events.emit("update-life", {
                playerID: this.player.id,
                vidas: GameState.sharedLives
            });
        }
    }

    // ============================
    // 🟥 VERSUS → CURA VIDA INDIVIDUAL
    // ============================
    else {
        const playerState = this.player.id === 1 ? GameState.player1 : GameState.player2;

        if (playerState.lives < 3) {
            playerState.lives++;
            events.emit("update-life", {
                playerID: this.player.id,
                vidas: playerState.lives
            });
        }
    }

    // ============================
    // ✨ FEEDBACK DE ÉXITO SEPARADO (IZQ/DER)
    // ============================

    const cam = this.scene.cameras.main;
    const cx = cam.scrollX + cam.width / 2;
    const cy = cam.scrollY + cam.height / 2;

    // Player 1 → panel IZQUIERDO
    // Player 2 → panel DERECHO
    let x = (this.player.id === 1)
        ? cx - cam.width * 0.28
        : cx + cam.width * 0.28;

    let y = cy - cam.height * 0.28;

    const text = this.scene.add.text(
    x,
    y,
    getPhrase("¡BUEN RITMO!"),

        {
            fontFamily: "PixelFont",
            fontSize: 26,
            color: "#fff300",
            stroke: "#000000",
            strokeThickness: 4,
        }
    )
        .setOrigin(0.5)
        .setDepth(120);

    this.scene.tweens.add({
        targets: text,
        y: y - 40,
        alpha: 0,
        duration: 1000,
        ease: "Sine.easeInOut",
        onComplete: () => text.destroy(),
    });

    // ============================
    // 🔓 LIBERAR MOVIMIENTO + RESET
    // ============================
    this.scene.time.delayedCall(1200, () => {
        this.player.canMove = true;
        this.active = false;
        this.comboLength = Math.min(6, this.comboLength + 1);
        this.cleanupInputHandlers();
        this.currentArrow = null;
        this.dpadCooldown = false;
    });
}


  fail(arrow) {
  // Animación de error
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

  // Feedback “FALLO”
  this.showHitFeedback(getPhrase("¡FALLO!"));


  // Reset de este jugador
  this.delay = 1200;
  this.player.canMove = true;
  this.active = false;

  this.cleanupInputHandlers();
  this.dpadCooldown = false;

  // ⭐ MUY IMPORTANTE:
  // No relanzar combo del otro jugador.
  // Solo termina este combo.
}


  cleanupInputHandlers() {
  if (this.keyboardHandler) {
    this.keyboardHandler = null;
  }
}

  destroy() {
    this.cleanupInputHandlers();
    if (this.currentArrow && this.currentArrow.active) {
      this.currentArrow.destroy();
    }
  }

  // ✅ NUEVO MÉTODO: Para debug completo del sistema
  debugFullInputState(playerKey) {
    const inputSystem = this.scene.inputSystem;
    if (!inputSystem) return;

    const gamepad = playerKey === "player1" ? inputSystem.gamepad1 : inputSystem.gamepad2;
    if (!gamepad) {
      console.log(`❌ ${playerKey}: No hay gamepad conectado`);
      return;
    }

    console.log(`🎮 DEBUG COMPLETO ${playerKey}:`, {
      expected: this.expected,
      active: this.active,
      cooldown: this.dpadCooldown,
      DPad: {
        UP: inputSystem.isGamepadPressed(INPUT_ACTIONS.UP, playerKey),
        DOWN: inputSystem.isGamepadPressed(INPUT_ACTIONS.DOWN, playerKey),
        LEFT: inputSystem.isGamepadPressed(INPUT_ACTIONS.LEFT, playerKey),
        RIGHT: inputSystem.isGamepadPressed(INPUT_ACTIONS.RIGHT, playerKey),
      },
      DPadJustPressed: {
        UP: inputSystem.isGamepadJustPressed(INPUT_ACTIONS.UP, playerKey),
        DOWN: inputSystem.isGamepadJustPressed(INPUT_ACTIONS.DOWN, playerKey),
        LEFT: inputSystem.isGamepadJustPressed(INPUT_ACTIONS.LEFT, playerKey),
        RIGHT: inputSystem.isGamepadJustPressed(INPUT_ACTIONS.RIGHT, playerKey),
      },
      totalButtons: gamepad.buttons.length
    });
  }
}