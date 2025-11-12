import Phaser from "phaser";
import { GameState } from "../game/state/GameState.js";
import { events } from "./GameEvents.js";
import { INPUT_ACTIONS } from "../game/utils/InputSystem.js";

export default class Recolectables {
  constructor(scene, objetos) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    // Crear donas
    objetos.forEach((obj) => {
      if (obj.name === "donas") {
        const donut = this.group.create(obj.x, obj.y, "donas").setScale(0.7);
        donut.setData("type", "donut");
        donut.setImmovable(true);
        donut.body.allowGravity = false;
      }
    });
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
        }
      });
    });
  }
}