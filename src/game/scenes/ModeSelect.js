import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";
import Background from "../../classes/Background.js";

export class ModeSelect extends Scene {
  constructor() {
    super("ModeSelect");
  }

  create() {
// === MÚSICA DE FONDO DEL MENÚ (continúa) ===
    // Solo reproducir si no está ya sonando
    if (!this.sound.get("menu")?.isPlaying) {
      this.menuMusic = this.sound.add("menu", { 
        volume: 0.3,
        loop: true 
      });
      this.menuMusic.play();
    }

    const W = this.scale.width;
    const H = this.scale.height;

    // ======================================================
    // 🎨 FONDO COMPLETO (usa la clase Background)
    // ======================================================
    new Background(this, "background4").create(); // usa tu background4 como en el menú

    // ======================================================
    // 🌫️ NUBES LILAS FLOTANDO
    // ======================================================
    this.nubes = [];

    const nubeA = this.add.image(W * 0.20, H * 0.25, "nubemorada1")
      .setAlpha(0.85)
      .setScale(1.5)
      .setDepth(2);

    const nubeB = this.add.image(W * 0.30, H * 0.48, "nubemorada2")
      .setAlpha(0.9)
      .setScale(1.6)
      .setDepth(2);

    const nubeC = this.add.image(W * 0.80, H * 0.60, "nubemorada1")
      .setAlpha(0.8)
      .setScale(1.4)
      .setDepth(2);

    this.nubes.push(nubeA, nubeB, nubeC);

    this.nubes.forEach((n, i) => {
      // movimiento horizontal
      this.tweens.add({
        targets: n,
        x: n.x + (i % 2 === 0 ? 35 : -35),
        duration: 6000 + i * 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // movimiento vertical suave
      this.tweens.add({
        targets: n,
        y: n.y + 12,
        duration: 3300 + i * 750,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

  // ======================================================
// 📝 TÍTULO — ESTILO NEÓN COMO CHARACTER SELECT
// ======================================================
const titulo = this.add.text(W / 2, H * 0.12, "SELECCIONA EL MODO DE JUEGO", {
  fontFamily: '"Press Start 2P"',
  fontSize: "32px",
  color: "#d6b6ffff",        // rosa pastel interno
  stroke: "#8c00ffff",       // borde rosa neón fuerte
  strokeThickness: 6,
  shadow: {
    offsetX: 0,
    offsetY: 0,
    color: "#ba66ffff",      // halo rosa neón
    blur: 45,
    fill: true
  }
})
.setOrigin(0.5)
.setDepth(20);

// ANIMACIÓN DE "latido" neón
this.tweens.add({
  targets: titulo,
  scale: 1.04,
  duration: 900,
  yoyo: true,
  repeat: -1,
  ease: "Sine.easeInOut"
});

    // === Distancia fija para acercarlos ===
    const dist = 170;  // ajústalo si querés más o menos cerca
    const yCenter = H * 0.52;

    this.vsBtn  = this.add.image(W / 2 - dist, yCenter, "SelectVersus")
      .setScale(1.1)
      .setDepth(6);
    this.coopBtn = this.add.image(W / 2 + dist, yCenter, "SelectCoop")
      .setScale(1.1)
      .setDepth(6);

    this.buttons = [this.vsBtn, this.coopBtn];
    this.selectedIndex = 0;

    // === Input System (TU LÓGICA ORIGINAL) ===
    this.inputSystem = new InputSystem(this.input);
    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.LEFT]:  ["LEFT", "A"],
      [INPUT_ACTIONS.RIGHT]: ["RIGHT", "D"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"]
    });

    this.updateSelection();

    // === Instrucciones con Press Start 2P ===
    this.add.text(W / 2, H * 0.90,
      "← → PARA NAVEGAR — ENTER PARA SELECCIONAR",
      {
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        fontSize: "12px",
        color: "#ffff00",
        stroke: "#000000",
        strokeThickness: 3
      }
    ).setOrigin(0.5).setDepth(5);
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

    // Si el botón NO tiene un glow, se lo creamos
    if (!btn.glow) {
      btn.glow = this.add.image(btn.x, btn.y, btn.texture.key)
        .setDepth(btn.depth - 1)
        .setScale(btn.scale)
        .setAlpha(0)
        .setTint(0xffffff);

      // Lo linkeamos al botón en el update
      btn.glow.follow = btn;
    }

    const glow = btn.glow;

    if (i === this.selectedIndex) {

      // Colores diferentes por botón
      if (i === 0) {
        glow.setTint(0xff8aff);  // rosa
      } else {
        glow.setTint(0x5fd6ff);  // celeste
      }

      // efecto glow
      glow.setAlpha(0.55);
      glow.setScale(btn.scale * 1.18);

      btn.setTint(0xffffff);
      btn.setScale(1.3);

    } else {

      glow.setAlpha(0);
      btn.setTint(0xffffff);
      btn.setScale(1.1);
    }

  });

  // Sincronizar glow con el botón
this.buttons.forEach(btn => {
  if (btn.glow) {
    btn.glow.x = btn.x;
    btn.glow.y = btn.y;
    btn.glow.setScale(btn.scale * 1.18);
  }
});

}
   selectMode(mode) {
    GameState.mode = mode;
    
    // ✅ DETENER MÚSICA DEL MENÚ ANTES DE IR AL JUEGO
    if (this.sound.get("menu")?.isPlaying) {
      this.sound.get("menu").stop();
    }
    
    this.scene.start("Game");
  }
  shutdown() {
    // Solo detener si vamos al juego, no si volvemos atrás
  }
}


