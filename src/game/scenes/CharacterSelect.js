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

    this.currentPlayer = 1;
    this.selectedIndex = 0;

    this.titleText = this.add
      .text(512, 100, "Jugador 1: elige tu personaje", {
        fontSize: "28px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Sprites
    this.pinky = this.add.sprite(300, 384, "SelectPinky").setScale(1.1);
    this.lamb = this.add.sprite(724, 384, "SelectLamb").setScale(1.1);
    this.characters = [this.pinky, this.lamb];

    // === INPUT SYSTEM SIMPLE ===
    this.inputSystem = new InputSystem(this.input);
    
    // Configurar navegación básica
    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.LEFT]: ["LEFT", "A"],
      [INPUT_ACTIONS.RIGHT]: ["RIGHT", "D"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"] // Seleccionar
    });

    this.updateSelection();

    // Instrucciones
    this.add
      .text(512, 650, "← → para navegar, ENTER para seleccionar", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  update() {
    // Navegación izquierda/derecha
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT)) {
      this.selectedIndex = 0;
      this.updateSelection();
    }
    
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)) {
      this.selectedIndex = 1;
      this.updateSelection();
    }
    
    // Seleccionar personaje (también funciona con gamepad)
    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
        this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)) {
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
      this.titleText.setText("Jugador 2: elige tu personaje");
      this.selectedIndex = 0;
      this.updateSelection();
    } else {
      GameState.player2.character = character;
      this.scene.start("ModeSelect");
    }
  }
}