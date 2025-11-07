import Phaser from "phaser";
import { events } from "./GameEvents.js";
import { GameState } from "../game/state/GameState.js";

export default class Combo {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.active = false;
    this.sequence = [];
    this.currentIndex = 0;

    this.delay = 1200; // tiempo entre flechas
    this.minDelay = 900; // velocidad máxima
    this.speedBoost = 100; // cada acierto reduce el delay
    this.timer = null;
    this.comboLength = 4; // cantidad inicial de flechas
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.player.canMove = false;

    // cantidad de flechas 4–6
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

    // caída suave
    this.scene.tweens.add({
      targets: arrow,
      y: y,
      duration: 800,
      ease: "Sine.easeOut",
    });

    // marca la esperada
    this.expected = dir;

    // Input
    this.scene.input.keyboard.once("keydown", (e) => this.handleInput(e, arrow));

    // si no presiona nada en 1.8 s → falla
    this.scene.time.delayedCall(1800, () => {
      if (arrow.active) this.fail(arrow);
    });
  }

  handleInput(event, arrow) {
    const pressed = this.mapKey(event.code);
    if (pressed === this.expected) {
      // Acierto
      arrow.setTint(0x00ff00);
      this.scene.tweens.add({
        targets: arrow,
        alpha: 0,
        duration: 200,
        onComplete: () => arrow.destroy(),
      });

      this.currentIndex++;
      this.delay = Math.max(this.delay - this.speedBoost, this.minDelay);
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
    const vidas = GameState.healPlayer(this.player.id);
    events.emit("update-life", { playerID: this.player.id, vidas });

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

    // liberar movimiento
    this.scene.time.delayedCall(1200, () => {
      this.player.canMove = true;
      this.active = false;
      this.comboLength = Math.min(6, this.comboLength + 1);
    });
  }

  fail(arrow) {
    arrow.setTint(0xff0000);
    this.scene.tweens.add({
      targets: arrow,
      alpha: 0,
      duration: 300,
      onComplete: () => arrow.destroy(),
    });

    this.delay = 1200;
    this.player.canMove = true;
    this.active = false;
  }
}
