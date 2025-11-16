import { Scene } from "phaser"; 
import { GameState } from "../state/GameState.js";
import Background from "../../classes/Background.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class CharacterSelect extends Scene {
  constructor() {
    super("CharacterSelect");
  }

  create() {
    const bg = new Background(this);
    bg.create();

    const W = this.scale.width;
    const H = this.scale.height;

    this.currentPlayer = 1;
    this.selectedIndex = 0;

    this.titleText = this.add
      .text(W / 2, H * 0.12, "JUGADOR 1: ELIGE PERSONAJE", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000",
        strokeThickness: 4
      })
      .setOrigin(0.5);

    // === Personajes más juntos y centrados ===
    const offsetX = W * 0.22; // ANTES 0.30 → más pegados

    this.pinky = this.add.sprite(W / 2 - offsetX, H * 0.55, "SelectPinky").setScale(1.1);
    this.lamb  = this.add.sprite(W / 2 + offsetX, H * 0.55, "SelectLamb").setScale(1.1);
    this.characters = [this.pinky, this.lamb];

    // INPUT
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.LEFT]: ["LEFT", "A"],
      [INPUT_ACTIONS.RIGHT]: ["RIGHT", "D"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"]
    });

    this.updateSelection();

    this.add.text(W / 2, H * 0.90,
      "← → PARA NAVEGAR, ENTER/A PARA SELECCIONAR",
      {
        fontFamily: '"Press Start 2P"',
        fontSize: "12px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 2
      }
    ).setOrigin(0.5);
  }

  update() {
    this.inputSystem.update?.();

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT)) {
      this.selectedIndex = 0;
      this.updateSelection();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)) {
      this.selectedIndex = 1;
      this.updateSelection();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH)) {
      const choice = this.selectedIndex === 0 ? "Pinky" : "Lamb";
      this.selectCharacter(choice);
    }
  }

  updateSelection() {
    this.characters.forEach((sprite, i) => {
      sprite.setTint(i === this.selectedIndex ? 0xffff99 : 0xffffff);
      sprite.setScale(i === this.selectedIndex ? 1.3 : 1.1);
    });
  }

  selectCharacter(character) {
    if (this.currentPlayer === 1) {
      GameState.player1.character = character;
      this.currentPlayer = 2;
      this.titleText.setText("JUGADOR 2: ELIGE PERSONAJE");
      this.selectedIndex = 0;
      this.updateSelection();
    } else {
      GameState.player2.character = character;
      this.scene.start("ModeSelect");
    }
  }
}
