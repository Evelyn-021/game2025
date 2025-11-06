import Phaser from "phaser";
import { GameState } from "../game/state/GameState.js";
import { events } from "./GameEvents.js"; // 💡 EventEmitter global

export default class Recolectables {
  constructor(scene, objetos) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    // Crear donas a partir del object layer
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
      // Teclas: Jugador 1 = E, Jugador 2 = ENTER
      const key =
        index === 0
          ? this.scene.input.keyboard.addKey(
              Phaser.Input.Keyboard.KeyCodes.E
            )
          : this.scene.input.keyboard.addKey(
              Phaser.Input.Keyboard.KeyCodes.ENTER
            );

      // 🍩 Recolectar dona
      this.scene.physics.add.overlap(player, this.group, (jugador, donut) => {
        if (
          Phaser.Input.Keyboard.JustDown(key) &&
          !jugador.getData("tieneDona")
        ) {
          jugador.setData("tieneDona", true);
          donut.disableBody(true, true);
          jugador.donaActual = donut;
          this.scene.audioManager?.play("collect");
        }
      });

      // 📦 Entregar en caja
      const cajaAsignada = cajas[index];
      this.scene.physics.add.overlap(player, cajaAsignada, (jugador) => {
        if (Phaser.Input.Keyboard.JustDown(key) && jugador.getData("tieneDona")) {
          jugador.setData("tieneDona", false);
          jugador.donaActual = null;
          jugador.donasRecolectadas = (jugador.donasRecolectadas || 0) + 1;

          if (jugador.id === 1)
            GameState.player1.donasRecolectadas = jugador.donasRecolectadas;
          else
            GameState.player2.donasRecolectadas = jugador.donasRecolectadas;

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
