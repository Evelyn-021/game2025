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
      
      // 🍩 Recolectar dona (Tecla E/ENTER o Botón EAST del gamepad)
      this.scene.physics.add.overlap(player, this.group, (jugador, donut) => {
        const keyboardAction = index === 0 ? 
          this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E) :
          this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // ✅ DETECCIÓN MIXTA: Teclado + Joystick
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
  // ✅ SOLO se juntan si falta vida (menos de 6 vidas)
  if (GameState.sharedLives < 6) {
    cherry.disableBody(true, true);

    // ❤️ Curar al equipo
    GameState.healShared();
    this.scene.audioManager?.play("salud");

    events.emit("update-life", {
      playerID: jugador.id,
      vidas: GameState.sharedLives
    });

    // 🔥 Respawn en 2 segundos
    this.scene.time.delayedCall(2000, () => {
      const puntos = this.scene.objetosMapa.filter(o => o.name === "cerezaSpawn");
      if (puntos.length > 0) {
        const p = Phaser.Utils.Array.GetRandom(puntos);
        this.spawnCherry(p.x, p.y);
      }
    });
  }
});

      // 📦 Entregar en caja
      const cajaAsignada = cajas[index];
      this.scene.physics.add.overlap(player, cajaAsignada, (jugador) => {
        const keyboardAction = index === 0 ? 
          this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E) :
          this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        
        // ✅ DETECCIÓN MIXTA: Teclado + Joystick
        const shouldDeliver = Phaser.Input.Keyboard.JustDown(keyboardAction) ||
                             this.scene.inputSystem?.isJustPressed(INPUT_ACTIONS.EAST, playerKey);
        
        if (shouldDeliver && jugador.getData("tieneDona")) {
          jugador.setData("tieneDona", false);
          jugador.donaActual = null;
          jugador.donasRecolectadas = (jugador.donasRecolectadas || 0) + 1;

          if (jugador.id === 1)
            GameState.player1.donasRecolectadas = jugador.donasRecolectadas;
          else
            GameState.player2.donasRecolectadas = jugador.donasRecolectadas;

          events.emit("dona-recolectada", jugador.id);
          events.emit("update-donas", {
            playerID: jugador.id,
            cantidad: jugador.donasRecolectadas,
          });

          this.scene.audioManager?.play("collect");

          // 🎯 VERIFICACIÓN DE META - SOLO COOP
          if (GameState.mode === "coop") {
            const p1 = GameState.player1.donasRecolectadas || 0;
            const p2 = GameState.player2.donasRecolectadas || 0;
            const teamScore = p1 + p2;
            const meta = GameState.metaDonas;
            
            if (teamScore >= meta) {
              console.log(`🎉 ¡Meta alcanzada! ${teamScore}/${meta} donas`);
              
              const tiempo = this.scene.scene.get("HUDScene")?.timeLeft ?? 0;
              
              // Detener el juego inmediatamente
              this.scene.scene.stop("HUDScene");
              
              // Ir a VictoryScene
              this.scene.scene.start("VictoryScene", {
                winner: "TEAM",
                p1,
                p2,
                tiempo,
              });
              
              // Aumentar meta para la próxima ronda
              GameState.metaDonas += 10;
              
              // Salir del bucle para evitar ejecuciones adicionales
              return;
            }
          }

          // ⭐ VERSUS → respawn de la dona automáticamente
          if (GameState.mode === "versus") {
            this.scene.time.delayedCall(1500, () => {
              const puntos = this.scene.objetosMapa.filter(o => o.name === "donaSpawn");
              if (puntos.length > 0) {
                const p = Phaser.Utils.Array.GetRandom(puntos);
                this.spawnDonut(p.x, p.y);
              }
            });
          }
        }
      });
    });
  }
}