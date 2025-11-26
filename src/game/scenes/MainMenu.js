import { Scene } from "phaser";
import Background from "../../classes/Background.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
// === MÚSICA DEL MENÚ — SINGLETON ===
if (!this.sound.get("menu")) {
  this.menuMusic = this.sound.add("menu", {
    volume: 0.3,
    loop: true
  });
  this.menuMusic.play();
} else {
  // Si ya existe, asegurar que suene
  const m = this.sound.get("menu");
  if (!m.isPlaying) m.play();
}


    // === FONDO ===
    const bg = new Background(this);
    bg.create();

    // === NUBES ROSAS SUPERIORES ===
    this.nubes = [];

    const nube1 = this.add.image(200, 200, "nuberosa1")
      .setAlpha(0.85)
      .setScale(1.1)
      .setDepth(6);

    const nube2 = this.add.image(950, 260, "nuberosa2")
      .setAlpha(0.9)
      .setScale(1.7)
      .setDepth(6);

    const nube3 = this.add.image(180, 420, "nuberosa3")
      .setAlpha(0.8)
      .setScale(1.7)
      .setDepth(6);

    this.nubes.push(nube1, nube2, nube3);

    // Animación suave de nubes
    this.nubes.forEach((n, i) => {
      this.tweens.add({
        targets: n,
        x: n.x + (i % 2 === 0 ? 40 : -40),
        duration: 6000 + i * 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.tweens.add({
        targets: n,
        y: n.y + 10,
        duration: 3500 + i * 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    // === LOGO ===
    this.logo = this.add
      .image(this.scale.width / 2, 250, "logo")
      .setScale(0.4)
      .setAlpha(0)
      .setDepth(5);

    // Glow del logo
    this.logoGlow = this.add
      .image(this.scale.width / 2, 250, "logo")
      .setTint(0xffaaff)
      .setScale(0.42)
      .setAlpha(0.15)
      .setDepth(4);

    // Animación POP
    this.tweens.add({
      targets: [this.logo, this.logoGlow],
      alpha: 1,
      scale: 0.6,
      duration: 900,
      ease: "Back.out",
    });

    // Flotación del logo
    this.tweens.add({
      targets: [this.logo, this.logoGlow],
      y: 240,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

  // ============================================================
// 🍩 DULCES FLOTANDO — MÁS GALLETAS + SEPARACIÓN ENTRE ELLOS
// ============================================================

this.dulces = [];

const dulcesTextures = [
  "donagrande",
  "donagrande", // repetir para aumentar frecuencia
  "galletagrande",
  "galletagrande" // más galletas
];

const cantidad = 18;               // más dulces en pantalla
const distanciaMinima = 110;       // separación mínima entre dulces

for (let i = 0; i < cantidad; i++) {
  const tex = Phaser.Utils.Array.GetRandom(dulcesTextures);

  let x, y, valido;

  // Intentar múltiples veces hasta conseguir un lugar con espacio
  let intentos = 0;

  do {
    intentos++;
    valido = true;

    x = Phaser.Math.Between(80, this.scale.width - 80);
    y = Phaser.Math.Between(70, this.scale.height - 160);

    // evitar zona del logo
    const dx = x - this.logo.x;
    const dy = y - this.logo.y;
    const distLogo = Math.sqrt(dx * dx + dy * dy);

    if (distLogo < 230) {
      valido = false;
      continue;
    }

    // evitar que se junten entre sí
    for (const dulce of this.dulces) {
      const dx2 = x - dulce.x;
      const dy2 = y - dulce.y;
      const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

      if (dist < distanciaMinima) {
        valido = false;
        break;
      }
    }

  } while (!valido && intentos < 25); // límite por seguridad

  // Crear dulce
  let obj = this.add.image(x, y, tex)
    .setScale(0.30 + Math.random() * 0.25)
    .setAlpha(0.92)
    .setDepth(7);

  // Animación horizontal suave
  this.tweens.add({
    targets: obj,
    x: obj.x + Phaser.Math.Between(-45, 45),
    duration: Phaser.Math.Between(3500, 6500),
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  // Animación vertical suave
  this.tweens.add({
    targets: obj,
    y: obj.y + Phaser.Math.Between(-20, 20),
    duration: Phaser.Math.Between(3500, 6000),
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  // Rotación suave
  this.tweens.add({
    targets: obj,
    angle: Phaser.Math.Between(-12, 12),
    duration: Phaser.Math.Between(6000, 10000),
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  this.dulces.push(obj);
}


    // === BOTÓN "JUGAR" ===
    this.startButton = this.add
      .text(this.scale.width / 2, 560, "JUGAR", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 32,
        color: "#ffc1e7ff",
        stroke: "#ff009dff",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    // === Input System ===
    this.inputSystem = new InputSystem(this.input);

    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.UP]: ["W", "UP"],
      [INPUT_ACTIONS.DOWN]: ["S", "DOWN"],
      [INPUT_ACTIONS.LEFT]: ["A", "LEFT"],
      [INPUT_ACTIONS.RIGHT]: ["D", "RIGHT"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.SOUTH]: ["X", "ESC"],
      [INPUT_ACTIONS.EAST]: ["E"],
      [INPUT_ACTIONS.WEST]: ["Q"],
    });

    // Eventos del botón
    this.startButton.on("pointerover", () => this.highlightButton(true));
    this.startButton.on("pointerout", () => this.highlightButton(false));
    this.startButton.on("pointerdown", () => this.startGame());

    // Texto inferior
    this.pressText = this.add
      .text(this.scale.width / 2, 620, "Presiona A o X para comenzar", {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 14,
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(8);

    this.tweens.add({
      targets: this.pressText,
      alpha: { from: 1, to: 0.2 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.highlightButton(true);
  }

  update() {
    // cualquier input → jugar
    if (
      this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.UP) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.LEFT) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.RIGHT)
    ) {
      this.startGame();
    }
  }

  highlightButton(highlight) {
    if (highlight) {
      this.startButton
        .setColor("#ffffff")
        .setStroke("#ff009dff", 6)
        .setScale(1.1);
    } else {
      this.startButton
        .setColor("#ffc1e7ff")
        .setStroke("#ff009dff", 6)
        .setScale(1);
    }
  }

   startGame() {
    // NO detener la música aquí - seguirá sonando en CharacterSelect
    this.startButton.setColor("#fca8ffff");

    this.time.delayedCall(300, () => {
      this.scene.start("CharacterSelect");
    });
  }
  // Método para limpiar recursos cuando se cierra la escena
  shutdown() {
    // NO detener la música aquí para que continúe en las siguientes escenas
  }
}
