import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";

export class VersusScene extends Scene {
  constructor() {
    super("VersusScene");
  }

  create() {
    // Fondo del menú de modo
    const bg = this.add.image(0, 0, "background2").setOrigin(0, 0);
    bg.setDisplaySize(this.scale.width, this.scale.height);
    bg.setScrollFactor(0);

    // Texto principal
    this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, "¡PREPARATE PARA EL MODO VERSUS!", {
      fontFamily: "Arial Black",
      fontSize: 36,
      color: "#ff66cc",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center",
    }).setOrigin(0.5);

    // Botón iniciar
    const startButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, "INICIAR PARTIDA", {
      fontFamily: "Arial Black",
      fontSize: 32,
      color: "#ffffff",
      backgroundColor: "#ff66cc",
      padding: { x: 25, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startButton.on("pointerover", () => startButton.setColor("#000000"));
    startButton.on("pointerout", () => startButton.setColor("#ffffff"));
    startButton.on("pointerdown", () => {
      GameState.mode = "versus";
      this.scene.start("Game");
    });

    // Botón volver
    const backButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 120, "VOLVER", {
      fontFamily: "Arial Black",
      fontSize: 28,
      color: "#ff66cc",
      stroke: "#000",
      strokeThickness: 5,
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on("pointerover", () => backButton.setColor("#ffffff"));
    backButton.on("pointerout", () => backButton.setColor("#ff66cc"));
    backButton.on("pointerdown", () => this.scene.start("ModeSelect"));
  }
}
