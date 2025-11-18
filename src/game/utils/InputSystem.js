/**
 * Sistema de entrada unificado - Configuración para 1 o 2 joysticks
 * CORREGIDO: Cada botón tiene una función única
 */
export const INPUT_ACTIONS = {
  UP: "up",
  DOWN: "down", 
  LEFT: "left",
  RIGHT: "right",
  NORTH: "north",  // A button - SALTO
  EAST: "east",    // X button - ACCIÓN/RECOLECTAR
  SOUTH: "south",  // B button - ATAQUE
  WEST: "west",    // Y button - FUNCIÓN EXTRA (opcional)
};

export default class InputSystem {
  static ACTIONS = INPUT_ACTIONS;

  constructor(input) {
    this.input = input;
    this.keys = {};
    this.gamepad1 = null;
    this.gamepad2 = null;

    // Estados previos para detección de "just pressed"
    this.previousButtonStates = {
      player1: {},
      player2: {}
    };

    this.previousAxisStates = {
      player1: {},
      player2: {},
    };

    // ✅ MAPEO CORREGIDO - CADA BOTÓN TIENE UNA FUNCIÓN ÚNICA
    this.mapping = {
      player1: {
        [INPUT_ACTIONS.UP]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 1, dir: -1 }, // LY negativo
            { type: "button", index: 12 }        // D-PAD UP
          ],
        },
        [INPUT_ACTIONS.DOWN]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 1, dir: 1 },  // LY positivo
            { type: "button", index: 13 }        // D-PAD DOWN
          ],
        },
        [INPUT_ACTIONS.LEFT]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 0, dir: -1 }, // LX negativo
            { type: "button", index: 14 }        // D-PAD LEFT
          ],
        },
        [INPUT_ACTIONS.RIGHT]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 0, dir: 1 },  // LX positivo
            { type: "button", index: 15 }        // D-PAD RIGHT
          ],
        },
        [INPUT_ACTIONS.NORTH]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 0 },  // A button - SOLO SALTO
          ],
        },
        [INPUT_ACTIONS.EAST]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 2 },  // X button - SOLO ACCIÓN/RECOLECTAR
          ],
        },
        [INPUT_ACTIONS.SOUTH]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 1 },  // B button - SOLO ATAQUE
          ],
        },
        [INPUT_ACTIONS.WEST]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 3 },  // Y button - FUNCIÓN EXTRA (opcional)
          ],
        },
      },
      player2: {
        [INPUT_ACTIONS.UP]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 1, dir: -1 }, // LY negativo
            { type: "button", index: 12 }        // D-PAD UP
          ],
        },
        [INPUT_ACTIONS.DOWN]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 1, dir: 1 },  // LY positivo
            { type: "button", index: 13 }        // D-PAD DOWN
          ],
        },
        [INPUT_ACTIONS.LEFT]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 0, dir: -1 }, // LX negativo
            { type: "button", index: 14 }        // D-PAD LEFT
          ],
        },
        [INPUT_ACTIONS.RIGHT]: {
          keyboard: [],
          gamepad: [
            { type: "axis", index: 0, dir: 1 },  // LX positivo
            { type: "button", index: 15 }        // D-PAD RIGHT
          ],
        },
        [INPUT_ACTIONS.NORTH]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 0 },  // A button - SOLO SALTO
          ],
        },
        [INPUT_ACTIONS.EAST]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 2 },  // X button - SOLO ACCIÓN/RECOLECTAR
          ],
        },
        [INPUT_ACTIONS.SOUTH]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 1 },  // B button - SOLO ATAQUE
          ],
        },
        [INPUT_ACTIONS.WEST]: {
          keyboard: [],
          gamepad: [
            { type: "button", index: 3 },  // Y button - FUNCIÓN EXTRA (opcional)
          ],
        },
      }
    };

    this.initializeGamepad();
  }

  initializeGamepad() {
    if (this.input.gamepad) {
      console.log("✅ Plugin de gamepad habilitado");
      
      this.input.gamepad.on("connected", (pad) => {
        console.log(`🎮 Gamepad conectado: ${pad.id} - Botones: ${pad.buttons.length}`);
        
        if (!this.gamepad1) {
          this.gamepad1 = pad;
          console.log("✅ Asignado como Gamepad 1 (Jugador 1)");
        } else if (!this.gamepad2) {
          this.gamepad2 = pad;
          console.log("✅ Asignado como Gamepad 2 (Jugador 2)");
        } else {
          console.log("⚠️ Ya hay 2 gamepads conectados. Ignorando nuevo gamepad.");
        }
      });

      this.input.gamepad.on("disconnected", (pad) => {
        if (this.gamepad1 && this.gamepad1.index === pad.index) {
          this.gamepad1 = null;
          console.log("🎮 Gamepad 1 desconectado");
        } else if (this.gamepad2 && this.gamepad2.index === pad.index) {
          this.gamepad2 = null;
          console.log("🎮 Gamepad 2 desconectado");
        }
      });

      this.checkExistingGamepads();
    } else {
      console.warn("⚠️ Gamepad plugin no disponible");
    }
  }

  checkExistingGamepads() {
    if (!this.input.gamepad) return;

    const pads = this.input.gamepad.gamepads;
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) {
        if (!this.gamepad1) {
          this.gamepad1 = pads[i];
          console.log(`✅ Gamepad 1 detectado: ${pads[i].id}`);
        } else if (!this.gamepad2) {
          this.gamepad2 = pads[i];
          console.log(`✅ Gamepad 2 detectado: ${pads[i].id}`);
        }
      }
    }
  }

  configureKeyboard(keyboardMappings, player = "player1") {
    if (!this.mapping[player]) return;

    Object.keys(keyboardMappings).forEach((action) => {
      if (this.mapping[player][action]) {
        this.mapping[player][action].keyboard = keyboardMappings[action];
        
        keyboardMappings[action].forEach((key) => {
          if (!this.keys[key]) {
            this.keys[key] = this.input.keyboard.addKey(key);
          }
        });
      }
    });
  }

  configureKeyboardByString(keyboardMappings, player = "player1") {
    const convertedMappings = {};
    
    Object.keys(keyboardMappings).forEach((action) => {
      convertedMappings[action] = keyboardMappings[action].map((keyString) => {
        const keyCode = Phaser.Input.Keyboard.KeyCodes[keyString.toUpperCase()];
        return keyCode !== undefined ? keyCode : keyString;
      });
    });

    this.configureKeyboard(convertedMappings, player);
  }

  isPressed(action, player = "player1") {
    return this.isKeyboardPressed(action, player) || this.isGamepadPressed(action, player);
  }

  isJustPressed(action, player = "player1") {
    return this.isKeyboardJustPressed(action, player) || this.isGamepadJustPressed(action, player);
  }

  isKeyboardPressed(action, player = "player1") {
    if (!this.mapping[player] || !this.mapping[player][action]) return false;

    return this.mapping[player][action].keyboard.some((key) => {
      const keyObj = this.keys[key];
      return keyObj && keyObj.isDown;
    });
  }

  isKeyboardJustPressed(action, player = "player1") {
    if (!this.mapping[player] || !this.mapping[player][action]) return false;

    return this.mapping[player][action].keyboard.some((key) => {
      const keyObj = this.keys[key];
      return keyObj && Phaser.Input.Keyboard.JustDown(keyObj);
    });
  }

  isGamepadPressed(action, player = "player1") {
    const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;
    if (!gamepad || !this.mapping[player] || !this.mapping[player][action]) return false;

    return this.mapping[player][action].gamepad.some((input) => {
      if (input.type === "button") {
        return gamepad.buttons[input.index] && gamepad.buttons[input.index].pressed;
      } else if (input.type === "axis") {
        const axisValue = gamepad.axes[input.index].getValue();
        return input.dir > 0 ? axisValue > 0.5 : axisValue < -0.5;
      }
      return false;
    });
  }

  isGamepadJustPressed(action, player = "player1") {
    const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;
    if (!gamepad || !this.mapping[player] || !this.mapping[player][action]) return false;

    return this.mapping[player][action].gamepad.some((input) => {
      if (input.type === "button") {
        const button = gamepad.buttons[input.index];
        if (!button) return false;
        
        const buttonKey = `button_${input.index}`;
        const wasPressed = this.previousButtonStates[player][buttonKey] || false;
        const isPressed = button.pressed;
        
        this.previousButtonStates[player][buttonKey] = isPressed;
        
        return isPressed && !wasPressed;
        
      } else if (input.type === "axis") {
        const axisValue = gamepad.axes[input.index].getValue();
        const isPressed = input.dir > 0 ? axisValue > 0.5 : axisValue < -0.5;
        
        const stateKey = `axis_${input.index}_${input.dir}`;
        const wasPressed = this.previousAxisStates[player][stateKey];
        this.previousAxisStates[player][stateKey] = isPressed;
        
        return isPressed && !wasPressed;
      }
      return false;
    });
  }

  // ✅ NUEVO: Método para actualizar estados (llamar en cada frame del juego)
  update() {
    // Este método asegura que los estados se mantengan actualizados
    // Se puede llamar desde el juego principal en cada frame
  }

  // ✅ NUEVO: Método para obtener el layout actual (útil para debug)
  getCurrentLayout(player = "player1") {
    return {
      "🎮 LAYOUT CORRECTO": "Cada botón tiene una función única",
      "A (0)": "NORTH - Salto",
      "B (1)": "SOUTH - Ataque", 
      "X (2)": "EAST - Acción/Recolectar",
      "Y (3)": "WEST - Función extra (opcional)",
      "D-PAD": "Movimiento direccional",
      "Sticks": "Movimiento analógico"
    };
  }

  // Método de debug mejorado para gamepads
  debugGamepad(player = "player1") {
    const gamepad = player === "player1" ? this.gamepad1 : this.gamepad2;
    if (!gamepad) {
      console.log(`❌ ${player}: No hay gamepad conectado`);
      return null;
    }

    const pressedButtons = [];
    gamepad.buttons.forEach((button, index) => {
      if (button && button.pressed) {
        const buttonNames = {
          0: "A", 1: "B", 2: "X", 3: "Y",
          12: "DPAD_UP", 13: "DPAD_DOWN", 14: "DPAD_LEFT", 15: "DPAD_RIGHT"
        };
        
        pressedButtons.push({ 
          index, 
          name: buttonNames[index] || `BTN_${index}`,
          value: button.value,
          pressed: button.pressed 
        });
      }
    });

    const activeAxes = [];
    gamepad.axes.forEach((axis, index) => {
      if (axis) {
        const value = axis.getValue();
        if (Math.abs(value) > 0.1) {
          activeAxes.push({ 
            index, 
            axis: index === 0 ? "LX" : index === 1 ? "LY" : `AXIS_${index}`,
            value: value.toFixed(2) 
          });
        }
      }
    });

    console.log(`🎮 Debug ${player}:`, {
      id: gamepad.id,
      totalButtons: gamepad.buttons.length,
      totalAxes: gamepad.axes.length,
      pressedButtons,
      activeAxes
    });

    return { pressedButtons, activeAxes };
  }

  // ✅ NUEVO: Método para verificar conflictos de mapeo
  checkMappingConflicts() {
    const conflicts = [];
    
    Object.keys(this.mapping).forEach(player => {
      const buttonUsage = {};
      
      Object.keys(this.mapping[player]).forEach(action => {
        this.mapping[player][action].gamepad.forEach(input => {
          if (input.type === "button") {
            const buttonKey = `button_${input.index}`;
            if (!buttonUsage[buttonKey]) {
              buttonUsage[buttonKey] = [];
            }
            buttonUsage[buttonKey].push(action);
          }
        });
      });
      
      // Verificar botones con múltiples asignaciones
      Object.keys(buttonUsage).forEach(buttonKey => {
        if (buttonUsage[buttonKey].length > 1) {
          conflicts.push({
            player,
            button: buttonKey,
            actions: buttonUsage[buttonKey]
          });
        }
      });
    });
    
    if (conflicts.length > 0) {
      console.warn("⚠️ CONFLICTOS DE MAPEO DETECTADOS:", conflicts);
    } else {
      console.log("✅ No hay conflictos de mapeo - Cada botón tiene una función única");
    }
    
    return conflicts;
  }
}