import { Scene } from "phaser";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
  }

  init(data) {
    this.winner = data.winner;
  }

  create() {
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
    this.add.text(512, 300, `${this.winner} gana 🎉`, {
      fontSize: "48px",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(512, 450, "Presiona ENTER para volver al menú", {
      fontSize: "24px",
      color: "#dddddd"
    }).setOrigin(0.5);

    this.input.keyboard.once("keydown-ENTER", () => {
      this.scene.start("MainMenu");
    });
  }
}
