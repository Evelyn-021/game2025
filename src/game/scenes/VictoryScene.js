import { Scene } from "phaser";
import { GameState } from "../state/GameState.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";
import { getTranslations, getPhrase } from "../../services/translations";
import { ES, EN, PT } from "../../enums/languages";

export class VictoryScene extends Scene {
  constructor() {
    super("VictoryScene");
  }

  create(data) {
    this.data = data;
    const { winner, p1 = 0, p2 = 0, tiempo = 0 } = data;

    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.cameras.main.setBackgroundColor("#1a1a2e");

    // ========================
    // 🔥 GUARDAR SCORE FIREBASE
    // ========================
    try {
      const firebasePlugin = this.plugins.get('FirebasePlugin');
      
      if (firebasePlugin && firebasePlugin.ready) {
        const user = firebasePlugin.getUser();
        
        if (user) {
          const nombre = user.email || getPhrase("Anónimo");
          let puntaje = 0;

          if (GameState.mode === "coop") {
            puntaje = p1 + p2;
          } else {
            puntaje = winner === "Jugador 1" ? p1 : p2;
          }

          firebasePlugin.saveScore(nombre, puntaje)
            .then(() => console.log("✅ Score guardado en Firebase"))
            .catch(err => console.error("❌ Error guardando score:", err));
        }
      }
    } catch (error) {
      console.error("🔥 Error en Firebase:", error);
    }

    // =====================================================
    // SISTEMA DE ENTRADA
    // =====================================================
    this.inputSystem = new InputSystem(this.input);

    this.inputSystem.configureKeyboardByString({
      [INPUT_ACTIONS.UP]: ["UP", "W"],
      [INPUT_ACTIONS.DOWN]: ["DOWN", "S"],
      [INPUT_ACTIONS.NORTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.SOUTH]: ["ENTER", "SPACE"],
      [INPUT_ACTIONS.EAST]: ["ENTER"],
      [INPUT_ACTIONS.WEST]: ["ENTER"]
    });

    // 🎯 FONDO ARCOÍRIS PIXELADO (MÁS COMPACTO)
    const colors = [0xff3366, 0xff9933, 0xffff33, 0x33ff66, 0x3366ff, 0x9933ff];
    colors.forEach((color, i) => {
      this.add.rectangle(W / 2, 100 + (i * 30), W, 30, color).setAlpha(0.3);
    });

    // 🏆 TÍTULO VICTORIA (MÁS PEQUEÑO)
    this.add.text(W / 2, 50, getPhrase("¡VICTORIA!"), {
      fontFamily: '"Press Start 2P"',
      fontSize: "40px",
      color: "#ffff00",
      stroke: "#ff6600",
      strokeThickness: 6,
      shadow: {
        offsetX: 6,
        offsetY: 6,
        color: '#ff0000',
        blur: 0,
        fill: true
      }
    }).setOrigin(0.5);

    // ==============================
    // MENSAJE SEGÚN MODO (MÁS PEQUEÑO)
    // ==============================
    if (GameState.mode === "versus") {
      const key = winner === "Jugador 1" 
        ? "¡JUGADOR 1 GANA!" 
        : "¡JUGADOR 2 GANA!";

      this.add.text(W / 2, 110, getPhrase(key), {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#0000ff",
        strokeThickness: 4
      }).setOrigin(0.5);

    } else { //COOP
      this.add.text(W / 2, 110, getPhrase("¡AMBOS JUGADORES GANARON!"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "20px",
        color: "#00ff88",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // TIEMPO (MÁS PEQUEÑO)
    this.add.text(W / 2, 140, `${getPhrase("TIEMPO:")} ${tiempo}s`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "14px",
      color: "#00ffff",
      stroke: "#000",
      strokeThickness: 2
    }).setOrigin(0.5);

    // ==============================
    // PANEL PUNTUACIÓN (MÁS COMPACTO)
    // ==============================
    this.add.rectangle(W / 2, 260, Math.min(600, W - 40), 180, 0x000000, 0.8)
      .setStrokeStyle(4, 0xffff00);

    // Título tabla (MÁS PEQUEÑO)
    this.add.text(W / 2, 200, getPhrase("PUNTUACIONES"), {
      fontFamily: '"Press Start 2P"',
      fontSize: "18px",
      color: "#ffff00",
      stroke: "#000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // ======================================
    // SI ES COOP → PUNTUACIÓN DE EQUIPO
    // ======================================
    if (GameState.mode === "coop") {
      const teamScore = p1 + p2;
      const currentMeta = GameState.metaDonas - 5;
      const nextMeta = GameState.metaDonas;

      // PUNTUACIÓN DEL EQUIPO (MÁS COMPACTO)
      this.add.text(W / 2, 230, `${getPhrase("PUNTUACIÓN:")} ${teamScore}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ff66cc",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0.5);

      // META ALCANZADA (MÁS COMPACTO)
      this.add.text(W / 2, 255, `${getPhrase("META ALCANZADA:")} ${currentMeta}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#00ff88",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0.5);

      // PRÓXIMA META (MÁS COMPACTO)
      this.add.text(W / 2, 280, `${getPhrase("PRÓXIMA META:")} ${nextMeta}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "14px",
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0.5);

      // MEJOR PUNTUACIÓN (MÁS COMPACTO)
      let best = localStorage.getItem("bestTeamScore");
      best = best ? JSON.parse(best) : { donas: 0 };

      if (teamScore > best.donas) {
        best = { donas: teamScore };
        localStorage.setItem("bestTeamScore", JSON.stringify(best));
      }

      this.add.text(W / 2, 305, `${getPhrase("RÉCORD:")} ${best.donas}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "12px",
        color: "#ffaa00",
        stroke: "#000",
        strokeThickness: 2
      }).setOrigin(0.5);

    } else {
      // ============================
      // VERSUS — PUNTUACIONES INDIVIDUALES (COMPACTO)
      // ============================
      const jugadores = [
        { nombre: getPhrase("JUGADOR 1"), color: "#ff66cc", donas: p1 },
        { nombre: getPhrase("JUGADOR 2"), color: "#66ccff", donas: p2 }
      ].sort((a, b) => b.donas - a.donas);

      let y = 230;
      jugadores.forEach((p, i) => {
        const medal = i === 0 ? "🥇" : "🥈";
        const rank = i === 0 ? getPhrase("1RO") : getPhrase("2DO");
        
        // Posición (MÁS COMPACTO)
        this.add.text(W / 2 - 150, y, `${medal} ${rank}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: "16px",
          color: p.color,
          stroke: "#000",
          strokeThickness: 2
        }).setOrigin(0.5);

        // Nombre (MÁS COMPACTO)
        this.add.text(W / 2, y, p.nombre, {
          fontFamily: '"Press Start 2P"',
          fontSize: "14px",
          color: "#ffffff",
          stroke: "#000",
          strokeThickness: 2
        }).setOrigin(0.5);

        // Puntos (MÁS COMPACTO)
        this.add.text(W / 2 + 150, y, `${p.donas}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: "16px",
          color: "#ffff88",
          stroke: "#000",
          strokeThickness: 2
        }).setOrigin(0.5);

        y += 35;
      });

      // RÉCORD (COMPACTO)
      const ganador = winner === "Jugador 1" ? 1 : 2;
      const ganadorNombre = ganador === 1 
        ? getPhrase("JUGADOR 1") 
        : getPhrase("JUGADOR 2");

      let best = localStorage.getItem("bestVersusRecord");
      best = best ? JSON.parse(best) : { jugador: getPhrase("JUGADOR 1"), donas: 0 };

      if ((ganador === 1 && p1 > best.donas) || (ganador === 2 && p2 > best.donas)) {
        const nuevoValor = ganador === 1 ? p1 : p2;
        best = { jugador: ganadorNombre, donas: nuevoValor };
        localStorage.setItem("bestVersusRecord", JSON.stringify(best));
      }

      this.add.text(
        W / 2,
        305,
        `${getPhrase("RÉCORD:")} ${best.jugador} - ${best.donas}`,
        {
          fontFamily: '"Press Start 2P"',
          fontSize: "14px",
          color: "#ffb300",
          stroke: "#000",
          strokeThickness: 3
        }
      ).setOrigin(0.5);
    }

    // ==============================
    // CONTENEDOR DE BOTONES (COMPACTO)
    // ==============================
    this.add.rectangle(W / 2, 430, Math.min(500, W - 60), 150, 0x000000, 0.7)
      .setStrokeStyle(3, 0x00ff00);

    // Título de opciones
    this.add.text(W / 2, 390, getPhrase("¿QUÉ HACER?"), {
      fontFamily: '"Press Start 2P"',
      fontSize: "18px",
      color: "#00ff00",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    // ==============================
    // BOTONES INTERACTIVOS - CON SCORES Y COMPACTOS
    // ==============================
    if (GameState.mode === "coop") {
      this.buttons = [];

      this.continuarButton = this.add.text(W / 2, 420, getPhrase("SEGUIR JUGANDO"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#33ff33",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setInteractive();

      this.scoresButton = this.add.text(W / 2, 450, getPhrase("VER PUNTAJES"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setInteractive();

      this.menuButton = this.add.text(W / 2, 480, getPhrase("MENÚ PRINCIPAL"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#3366ff",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setInteractive();

      this.buttons.push(this.continuarButton, this.scoresButton, this.menuButton);

      this.continuarButton.on("pointerdown", () => this.selectContinuar());
    } else {
      // VERSUS
      this.buttons = [];

      this.revanchaButton = this.add.text(W / 2, 420, getPhrase("REVANCHA"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "18px",
        color: "#ff33ff",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setInteractive();

      this.scoresButton = this.add.text(W / 2, 450, getPhrase("VER PUNTAJES"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ffff00",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setInteractive();

      this.menuButton = this.add.text(W / 2, 480, getPhrase("MENÚ PRINCIPAL"), {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#3366ff",
        stroke: "#000",
        strokeThickness: 3,
      }).setOrigin(0.5).setInteractive();

      this.buttons.push(this.revanchaButton, this.scoresButton, this.menuButton);

      this.revanchaButton.on("pointerdown", () => this.selectRevancha());
    }

    this.scoresButton.on("pointerdown", () => this.selectScores());
    this.menuButton.on("pointerdown", () => this.selectMenu());

    this.selectedIndex = 0;
    this.updateSelection();
  }

  // =====================================================
  // ACTUALIZACIÓN DEL INPUT
  // =====================================================
  update() {
    this.inputSystem.update();

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.UP)) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelection();
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.DOWN)) {
      this.selectedIndex = Math.min(this.buttons.length - 1, this.selectedIndex + 1);
      this.updateSelection();
    }

    if (
      this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST) ||
      this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)
    ) {
      this.confirmSelection();
    }
  }

  // =====================================================
  // SELECCIÓN DE BOTONES
  // =====================================================
  updateSelection() {
    this.buttons.forEach((btn, index) => {
      this.tweens.killTweensOf(btn);

      if (index === this.selectedIndex) {
        btn.setColor("#ffffff")
          .setStroke("#ffff00", 4)
          .setScale(1.05);

        this.tweens.add({
          targets: btn,
          scale: 1.1,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
      } else {
        btn.setScale(1).setStroke("#000", 2);
        // Restaurar colores originales según el modo y posición
        if (GameState.mode === "coop") {
          if (index === 0) btn.setColor("#33ff33");
          else if (index === 1) btn.setColor("#ffff00");
          else btn.setColor("#3366ff");
        } else {
          if (index === 0) btn.setColor("#ff33ff");
          else if (index === 1) btn.setColor("#ffff00");
          else btn.setColor("#3366ff");
        }
      }
    });
  }

  confirmSelection() {
    if (GameState.mode === "coop") {
      if (this.selectedIndex === 0) this.selectContinuar();
      else if (this.selectedIndex === 1) this.selectScores();
      else this.selectMenu();
    } else {
      if (this.selectedIndex === 0) this.selectRevancha();
      else if (this.selectedIndex === 1) this.selectScores();
      else this.selectMenu();
    }
  }

  // =====================================================
  // ACCIONES DE BOTONES
  // =====================================================
  selectContinuar() {
    GameState.player1.donasRecolectadas = this.data.p1;
    GameState.player2.donasRecolectadas = this.data.p2;
    
    this.scene.stop("HUDScene");
    this.scene.start("Game");
  }

  selectRevancha() {
    GameState.player1.donasRecolectadas = 0;
    GameState.player1.lives = 3;
    GameState.player2.donasRecolectadas = 0;
    GameState.player2.lives = 3;

    this.scene.stop("HUDScene");
    this.scene.start("Game");
  }

  selectScores() {
    this.scene.start("Scores");
  }

  selectMenu() {
    GameState.reset();
    this.scene.start("MainMenu");
  }
}