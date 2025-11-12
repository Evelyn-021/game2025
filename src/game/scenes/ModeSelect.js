import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class ModeSelect extends Scene {
  constructor() {
    super("ModeSelect");
  }

  create() {
    this.add
      .text(512, 120, "Selecciona el modo de juego", {
        fontSize: "32px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.vsBtn = this.add.image(360, 384, "SelectVersus").setScale(1.1);
    this.coopBtn = this.add.image(664, 384, "SelectCoop").setScale(1.1);
    this.buttons = [this.vsBtn, this.coopBtn];
    this.selectedIndex = 0;

    // === INPUT SYSTEM SIMPLE ===
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.LEFT]: ["LEFT", "A"],
      [INPUT_ACTIONS.RIGHT]: ["RIGHT", "D"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"] // Seleccionar
    });

    this.updateSelection();

    this.add
      .text(512, 650, "← → para navegar, ENTER para seleccionar", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  update() {
    // Navegación
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT)) {
      this.selectedIndex = 0;
      this.updateSelection();
    }
    
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)) {
      this.selectedIndex = 1;
      this.updateSelection();
    }
    
    // Seleccionar modo (también funciona con gamepad)
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)) {
      const mode = this.selectedIndex === 0 ? "versus" : "coop";
      this.selectMode(mode);
    }
  }

  updateSelection() {
    this.buttons.forEach((sprite, i) => {
      sprite.setScale(i === this.selectedIndex ? 1.3 : 1.1);
      sprite.setTint(i === this.selectedIndex ? 0xffff99 : 0xffffff);
    });
  }

  selectMode(mode) {
    GameState.mode = mode;
    this.scene.start("Game");
  }
}