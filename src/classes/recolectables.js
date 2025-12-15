
// Sistema de recolectables: crea donas y cerezas, maneja colisiones,
// actualiza GameState y emite eventos al HUD. (detecta colisiones y emite eventos)

import Phaser from "phaser";
import { GameState } from "../game/state/GameState.js";
import { events } from "./GameEvents.js";
import { INPUT_ACTIONS } from "../game/utils/InputSystem.js";

export default class Recolectables {
  constructor(scene, objetos) {
    this.scene = scene;
    this.group = scene.physics.add.group();
    this.cherries = scene.physics.add.group(); // Nuevo grupo para cerezas

    // Crear donas
    objetos.forEach((obj) => {
      if (obj.name === "donas") {
        const donut = this.group.create(obj.x, obj.y, "donas").setScale(0.7);
        donut.setData("type", "donut");
        donut.setImmovable(true);
        donut.body.allowGravity = false;
      }
      
      // 🍒 Crear cerezas (solo en modo COOP)
      if (obj.name === "cereza" && GameState.mode === "coop") {
        const cherry = this.cherries.create(obj.x, obj.y, "cereza").setScale(0.7);
        cherry.setData("type", "cherry");
        cherry.setImmovable(true);
        cherry.body.allowGravity = false;
      }
    });
  }
  //spawnCherry
  spawnCherry(x, y) {
    const cherry = this.cherries.get(x, y, "cereza");

    if (!cherry) return;

    cherry.enableBody(true, x, y, true, true);
    cherry.setActive(true).setVisible(true);
    cherry.setScale(0.7);
    cherry.body.allowGravity = false;

    // Desaparecer si nadie la agarra en 10s
    this.scene.time.delayedCall(10000, () => {
      if (cherry.active) {
        cherry.disableBody(true, true);
      }
    });

    return cherry;
  }
  

  //spawndonuts
  spawnDonut(x, y) {
  const donut = this.group.get(x, y, "donas");

  if (!donut) return;

  donut.enableBody(true, x, y, true, true);
  donut.setActive(true).setVisible(true);
  donut.setScale(0.7);
  donut.setImmovable(true);
  donut.body.allowGravity = false;

  return donut;
}



  addColliders(players, cajas) {
  players.forEach((player, index) => {
    const playerKey = `player${player.id}`;
    
    // 🍩 Recolectar dona
    this.scene.physics.add.overlap(player, this.group, (jugador, donut) => {
      const keyboardAction = index === 0 ? 
        this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E) :
        this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      
      const shouldCollect = Phaser.Input.Keyboard.JustDown(keyboardAction) ||
                           this.scene.inputSystem?.isJustPressed(INPUT_ACTIONS.EAST, playerKey);
      
      if (shouldCollect && !jugador.getData("tieneDona")) {
        jugador.setData("tieneDona", true);
        donut.disableBody(true, true);
        jugador.donaActual = donut;
        this.scene.audioManager?.play("collect");
      }
    });

    // 🍒 Recolectar cereza
    this.scene.physics.add.overlap(player, this.cherries, (jugador, cherry) => {
      if (GameState.sharedLives < 6) {
        cherry.disableBody(true, true);
        GameState.healShared();
        this.scene.audioManager?.play("salud");
        
        events.emit("update-life", {
          playerID: jugador.id,
          vidas: GameState.sharedLives
        });

        this.scene.time.delayedCall(2000, () => {
          const puntos = this.scene.objetosMapa.filter(o => o.name === "cerezaSpawn");
          if (puntos.length > 0) {
            const p = Phaser.Utils.Array.GetRandom(puntos);
            this.spawnCherry(p.x, p.y);
          }
        });
      }
    });

// 📦 CORREGIDO: Entregar en caja - En coop ambos usan la misma caja
const cajaAsignada = GameState.mode === "coop" ? cajas[0] : cajas[index];

if (cajaAsignada) {
  this.scene.physics.add.overlap(player, cajaAsignada, (jugador) => {
    const keyboardAction = index === 0
      ? this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
      : this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    const shouldDeliver =
      Phaser.Input.Keyboard.JustDown(keyboardAction) ||
      this.scene.inputSystem?.isJustPressed(INPUT_ACTIONS.EAST, playerKey);

    if (shouldDeliver && jugador.getData("tieneDona")) {
      jugador.setData("tieneDona", false);
      jugador.donaActual = null;

      // ============================
      // SUMA DE DONAS (REAL)
      // ============================
      // 🛡 Sanitizar
      if (isNaN(GameState.player1.donasRecolectadas)) GameState.player1.donasRecolectadas = 0;
      if (isNaN(GameState.player2.donasRecolectadas)) GameState.player2.donasRecolectadas = 0;

      // Ahora sí sumamos
      if (jugador.id === 1) {
          GameState.player1.donasRecolectadas++;
      } else {
          GameState.player2.donasRecolectadas++;
      }
      // ============================
      const p1 = GameState.player1.donasRecolectadas;
      const p2 = GameState.player2.donasRecolectadas;
      const teamScore = p1 + p2;
      const meta = GameState.metaDonas;

      // ============================
      // EVENTO PARA HUD
      // ============================
      events.emit("update-donas", {
        playerID: jugador.id,
        cantidad: GameState.mode === "coop" ? teamScore : (jugador.id === 1 ? p1 : p2),
        p1,
        p2,
        teamScore,
        meta,
      });

      console.log(`🍩 DONA! P1=${p1} P2=${p2} TOTAL=${teamScore}/${meta}`);

      // ============================
      // ⭐ LÓGICA DE VICTORIA AHORA VA AQUÍ
      // ============================
      if (GameState.mode === "coop" && teamScore >= meta) {

        console.log("🎉 META ALCANZADA → VictoryScene");

        // Guardar tiempo actual del HUD
        const tiempo = this.scene.scene.get("HUDScene")?.timeLeft ?? 0;

        // Mover caja para la próxima ronda
        GameState.nextBoxPosition();

        // Subir meta (5, o el valor que uses)
        GameState.metaDonas += 5;
        

        // Resetear donas para la nueva ronda
        GameState.resetDonas();

        // Cambiar a VictoryScene
        this.scene.scene.stop("HUDScene");
        this.scene.scene.start("VictoryScene", {
          winner: "TEAM",
          p1,
          p2,
          tiempo
        });

        return;
      }

      this.scene.audioManager?.play("collect");

      // Respawn solo en Versus
      if (GameState.mode === "versus") {
        this.scene.time.delayedCall(1500, () => {
          const puntos = this.scene.objetosMapa.filter(
            (o) => o.name === "donaSpawn"
          );
          if (puntos.length > 0) {
            const p = Phaser.Utils.Array.GetRandom(puntos);
            this.spawnDonut(p.x, p.y);
          }
        });
      }
    }
  });
}
  }); }
}