import Phaser from "phaser";

export default class Recolectables {
  constructor(scene, objetos) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    objetos.forEach(obj => {
      if (obj.name === "donas") {
        const donut = this.group.create(obj.x, obj.y, "donas").setScale(0.7);
        donut.setData("type", "donut");
        donut.setImmovable(true);
        donut.body.allowGravity = false; // no caen del mapa
      }
    });
  }

  addColliders(players, cajas) {
    players.forEach((player, index) => {
      const teclaE = this.scene.input.keyboard.addKey("E");
      const teclaENTER = this.scene.input.keyboard.addKey("ENTER");
      const key = index === 0 ? teclaE : teclaENTER; // P1 usa E, P2 usa ENTER

      // 🧩 Recolectar dona
      this.scene.physics.add.overlap(player, this.group, (jugador, donut) => {
        if (
          Phaser.Input.Keyboard.JustDown(key) &&
          !jugador.getData("tieneDona")
        ) {
          jugador.setData("tieneDona", true);
          donut.setVisible(false);
          donut.disableBody(true, true);
          jugador.donaActual = donut;
          this.scene.sound.play("pickup");
        }
      });

      // 📦 Entregar en su caja correspondiente
      const cajaAsignada = cajas[index];
      this.scene.physics.add.overlap(player, cajaAsignada, () => {
        if (
          Phaser.Input.Keyboard.JustDown(key) &&
          jugador.getData("tieneDona")
        ) {
          jugador.setData("tieneDona", false);
          jugador.donaActual = null;

          jugador.score += 10;
          this.scene.events.emit("update-score", {
            playerID: jugador.id,
            score: jugador.score,
          });
          this.scene.sound.play("entregar");
        }
      });
    });
  }
}
