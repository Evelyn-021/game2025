import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class ModeSelect extends Scene {
  constructor() {
    super("ModeSelect");
  }

  create() {

    const W = this.scale.width;
    const H = this.scale.height;

    // === Título con Press Start 2P ===
    this.add.text(W / 2, H * 0.12, "SELECCIONA EL MODO DE JUEGO", {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
      letterSpacing: 1
    }).setOrigin(0.5);

    // === Distancia fija para acercarlos ===
    const dist = 170;  // ajústalo si querés más o menos cerca
    const yCenter = H * 0.52;

    this.vsBtn  = this.add.image(W / 2 - dist, yCenter, "SelectVersus").setScale(1.1);
    this.coopBtn = this.add.image(W / 2 + dist, yCenter, "SelectCoop").setScale(1.1);

    this.buttons = [this.vsBtn, this.coopBtn];
    this.selectedIndex = 0;

    // === Input System ===
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.LEFT]:  ["LEFT", "A"],
      [INPUT_ACTIONS.RIGHT]: ["RIGHT", "D"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"]
    });

    this.updateSelection();

    // === Instrucciones con Press Start 2P ===
    this.add.text(W / 2, H * 0.90, "← → PARA NAVEGAR — ENTER PARA SELECCIONAR", {
      fontFamily: '"Press Start 2P", "Courier New", monospace',
      fontSize: "12px",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  update() {
    // Navegar
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT)) {
      this.selectedIndex = 0;
      this.updateSelection();
    }
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)) {
      this.selectedIndex = 1;
      this.updateSelection();
    }

    // Seleccionar modo
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH)) {
      const mode = this.selectedIndex === 0 ? "versus" : "coop";
      this.selectMode(mode);
    }
  }

  updateSelection() {
    this.buttons.forEach((btn, i) => {
      btn.setScale(i === this.selectedIndex ? 1.3 : 1.1);
      btn.setTint(i === this.selectedIndex ? 0xffff99 : 0xffffff);
    });
  }

  selectMode(mode) {
    GameState.mode = mode;
    this.scene.start("Game");
  }
}
