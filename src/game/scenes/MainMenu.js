//Esta es la primera pantalla y uso 
// las traducciones para mostrar el texto según el idioma.
import { Scene } from "phaser";
import Background from "../../classes/Background.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";
import { getTranslations, getPhrase } from "../../services/translations";
import { ES, EN, PT } from "../../enums/languages";


export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // === MÚSICA DEL MENÚ — SINGLETON de Audio manager===
    if (!this.sound.get("menu")) {
      this.menuMusic = this.sound.add("menu", {
        volume: 0.3,
        loop: true
      });
      this.menuMusic.play();
    } else {
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
      .image(this.scale.width / 2, 220, "logo")
      .setScale(0.32)
      .setAlpha(0)
      .setDepth(5);

    this.logoGlow = this.add
      .image(this.scale.width / 2, 220, "logo")
      .setTint(0xffaaff)
      .setScale(0.35)
      .setAlpha(0.15)
      .setDepth(4);

    this.tweens.add({
      targets: [this.logo, this.logoGlow],
      alpha: 1,
      scale: 0.48,
      duration: 900,
      ease: "Back.out",
    });

    this.tweens.add({
      targets: [this.logo, this.logoGlow],
      y: 210,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ============================================================
    // 🍩 DULCES FLOTANDO
    // ============================================================
    this.dulces = [];

    const dulcesTextures = [
      "donagrande",
      "donagrande",
      "galletagrande",
      "galletagrande"
    ];

    const cantidad = 18;
    const distanciaMinima = 110;

    for (let i = 0; i < cantidad; i++) {
      const tex = Phaser.Utils.Array.GetRandom(dulcesTextures);

      let x, y, valido;
      let intentos = 0;

      do {
        intentos++;
        valido = true;

        x = Phaser.Math.Between(80, this.scale.width - 80);
        y = Phaser.Math.Between(70, this.scale.height - 160);

        const dx = x - this.logo.x;
        const dy = y - this.logo.y;
        const distLogo = Math.sqrt(dx * dx + dy * dy);

        if (distLogo < 230) {
          valido = false;
          continue;
        }

        for (const dulce of this.dulces) {
          const dx2 = x - dulce.x;
          const dy2 = y - dulce.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist < distanciaMinima) {
            valido = false;
            break;
          }
        }

      } while (!valido && intentos < 25);

      let obj = this.add.image(x, y, tex)
        .setScale(0.30 + Math.random() * 0.15)
        .setAlpha(0.92)
        .setDepth(7);

      this.tweens.add({
        targets: obj,
        x: obj.x + Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(3500, 6500),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.tweens.add({
        targets: obj,
        y: obj.y + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(3500, 6000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

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


      


        // ============================================================
    // 🌐 BOTÓN "LENGUAJE" — DESPLEGABLE
    // ============================================================
    this.langOpen = false;

        // === FONDO DEL BOTÓN DE LENGUAJE ===
        this.languageBg = this.add.graphics();
        this.languageBg.fillStyle(0x000000, 0.45); // negro semitransparente
        this.languageBg.fillRoundedRect(40, 25, 200, 40, 8); // x, y, ancho, alto, radio
        this.languageBg.setDepth(19);

    this.languageButton = this.add.text(
  140, 45,
  "🌐 " + (getPhrase("IDIOMA") || "IDIOMA"),
  {
    fontFamily: '"Press Start 2P"',
    fontSize: 14,
    color: "#ffffff",
    stroke: "#d763eeff",
    strokeThickness: 6,
  }
)
.setOrigin(0.5)
.setInteractive({ useHandCursor: true })
.setDepth(20); // encima del rectángulo




    // ============================================================
// 🇦🇷 🇺🇸 🇧🇷  BANDERAS (INICIALMENTE OCULTAS)
// ============================================================
this.flagButtons = [];

const flags = [
  { key: "flag_es", lang: ES, scale: 0.42 }, // Argentina (proporción ok)
  { key: "flag_en", lang: EN, scale: 0.34 }, // USA → más ancha
  { key: "flag_pt", lang: PT, scale: 0.45 }, // Brasil (proporción ok)
];


let offsetY = 80;

flags.forEach((f) => {
  const btn = this.add
  .image(120, offsetY, f.key)
  .setScale(f.scale)
  .setAlpha(0)
  .setDepth(19)
  .setInteractive({ useHandCursor: true });


  btn.lang = f.lang;

  btn.on("pointerdown", async () => {
    await getTranslations(btn.lang, () => this.scene.restart());
  });

  this.flagButtons.push(btn);
  offsetY += 60;
});


    // === BOTÓN "JUGAR" — TRADUCIDO ===
    this.startButton = this.add.text(
      this.scale.width / 2,
      500,
      getPhrase("JUGAR"), // ✔ TRADUCIBLE
      {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 26,
        color: "#ffc1e7ff",
        stroke: "#ff009dff",
        strokeThickness: 4,
      }
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);


this.languageButton.on("pointerdown", () => {
  this.langOpen = !this.langOpen;

  this.flagButtons.forEach((btn, i) => {
    this.tweens.add({
      targets: btn,
      alpha: this.langOpen ? 1 : 0,
      y: this.langOpen ? (100 + i * 60) : 80,
      duration: 250,
      ease: "Sine.easeInOut",
    });
  });
});



    // === INPUT SYSTEM ===
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

    // === Eventos del botón ===
    this.startButton.on("pointerover", () => this.highlightButton(true));
    this.startButton.on("pointerout", () => this.highlightButton(false));
    this.startButton.on("pointerdown", () => this.startGame());

    // === TEXTO INFERIOR — TRADUCIDO ===
    this.pressText = this.add.text(
      this.scale.width / 2,
      560,
      getPhrase("Presiona A o X para comenzar"), // ✔ TRADUCIBLE
      {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: 14,
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3,
      }
    )
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
    this.startButton.setColor("#fca8ffff");

    this.time.delayedCall(300, () => {
      this.scene.start("CharacterSelect");
    });
  }

  shutdown() {}
}
