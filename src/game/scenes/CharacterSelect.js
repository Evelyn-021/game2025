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
 


// ===============================
// DIRIGIBLES FLOTANDO
// ===============================

this.dir1 = this.add.image(W * 0.10, H * 0.25, "cake_valley_cupcake")
  .setScale(1.8)
  .setTint(0xffb6ff)
  .setAlpha(1)
  .setDepth(4);

this.dir2 = this.add.image(W * 0.90, H * 0.60, "cake_valley_cupcake")
  .setScale(1.4)
  .setTint(0xffccff)
  .setAlpha(0.9)
  .setDepth(3);

this.dir3 = this.add.image(W * 0.77, H * 0.10, "cake_valley_cupcake")
  .setScale(2.2)
  .setTint(0xe6aaff)
  .setAlpha(0.5)
  .setDepth(1);

// ==== FLOTACIÓN SUAVE ====

// Dirigible 1
this.tweens.add({
  targets: this.dir1,
  y: this.dir1.y + 15,
  duration: 2500,
  yoyo: true,
  repeat: -1,
  ease: "Sine.easeInOut"
});

// Dirigible 2
this.tweens.add({
  targets: this.dir2,
  y: this.dir2.y + 12,
  duration: 3200,
  yoyo: true,
  repeat: -1,
  ease: "Sine.easeInOut"
});

// Dirigible 3
this.tweens.add({
  targets: this.dir3,
  y: this.dir3.y + 18,
  duration: 4000,
  yoyo: true,
  repeat: -1,
  ease: "Sine.easeInOut"
});

    //========
    //TITULO 
    //========
    this.titleText = this.add.text(W / 2, H * 0.12, "JUGADOR 1: ELIGE PERSONAJE", {
    fontFamily: '"Press Start 2P"',
    fontSize: "32px",
    color: "#ffb6ff",         // rosa pastel interno
    stroke: "#ff00e6",        // borde rosa FUERTE (neón)
    strokeThickness: 6,
    shadow: {
      offsetX: 0,
      offsetY: 0,
      color: "#ff66ff",       // halo de neon
      blur: 45,               // clave para efecto glow
      fill: true
      }
    })
    .setOrigin(0.5)
    .setDepth(10);
    this.tweens.add({
    targets: this.titleText,
    scale: 1.04,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });



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

  const playerKey = this.currentPlayer === 1 ? "player1" : "player2";

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT, playerKey)) {
    this.selectedIndex = 0;
    this.updateSelection();
  }

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT, playerKey)) {
    this.selectedIndex = 1;
    this.updateSelection();
  }

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH, playerKey)) {
    const choice = this.selectedIndex === 0 ? "Pinky" : "Lamb";
    this.selectCharacter(choice);
  }
}


 updateSelection() {
  this.characters.forEach((sprite, i) => {

    if (i === this.selectedIndex) {

      // Tint especiales para cada personaje
      if (i === 0) {
        // Pinky → ROSA pastel
        sprite.setTint(0xffb6ff);
      } else {
        // Lamb → CELESTE pastel
        sprite.setTint(0xa7e8ff);
      }

      sprite.setScale(1.3);

    } else {
      sprite.setTint(0xffffff);
      sprite.setScale(1.1);
    }

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
