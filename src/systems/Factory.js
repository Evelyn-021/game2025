import Recolectables from "../classes/recolectables.js";

/**
 * 🎨 Factory central: crea objetos comunes del juego
 * Evita duplicar código dentro de las escenas.
 */
export default class Factory {

  /**
   * 🌍 Crea el tilemap y sus capas principales.
   * @param {Phaser.Scene} scene - Escena actual
   * @param {string} key - Nombre del mapa en el preload
   * @returns {Object} { map, plataformas, escaleras }
   */
  static createMap(scene, key = "map") {
    // Crea el mapa y carga los tilesets
    const map = scene.make.tilemap({ key });
    const sueloSet = map.addTilesetImage("suelo", "tiles");
    const escaleraSet = map.addTilesetImage("escalera", "escalera");

    // Capa de fondo
    const fondo = map.createLayer("Fondo", [sueloSet, escaleraSet], 0, 0).setDepth(-1);

    // Capa principal de plataformas
    const plataformas = map.createLayer("plataformas", [sueloSet, escaleraSet], 0, 0);
    plataformas.setCollisionByProperty({ esColisionable: true });

    // Capa de objetos escalables
    const usables = map.createLayer("usables", [sueloSet, escaleraSet], 0, 0);
    const escaleras = [];
    usables.forEachTile(t => { 
      if (t.properties.esEscalable) escaleras.push(t); 
    });

    // Retorna todas las capas que la escena necesita
    return { map, plataformas, escaleras };
  }

  /**
   * 📦 Crea y configura las cajas del nivel.
   * @param {Phaser.Scene} scene - Escena actual
   * @returns {Array} [caja1, caja2]
   */
  static createBoxes(scene) {
    // Genera las dos cajas base (Pinky y Lamb)
    const caja1 = scene.physics.add.sprite(120, 560, "caja").setScale(1.1);
    const caja2 = scene.physics.add.sprite(960, 560, "caja").setScale(1.1);

    // Las hace inmóviles y sin gravedad
    [caja1, caja2].forEach(c => {
      c.setImmovable(true);
      c.body.allowGravity = false;
    });

    return [caja1, caja2];
  }

  /**
   * 🍩 Crea los objetos recolectables del nivel (donas, pociones, etc.)
   * y configura sus colisiones con jugadores y cajas.
   * @param {Phaser.Scene} scene - Escena actual
   * @param {Array} objetos - Objetos del mapa (Tiled)
   * @param {Array} players - Jugadores activos [player1, player2]
   * @param {Array} boxes - Cajas físicas [caja1, caja2]
   * @returns {Recolectables}
   */
  static createRecolectables(scene, objetos, players, boxes) {
    // Crea el grupo de recolectables
    const recolectables = new Recolectables(scene, objetos);

    // Agrega colisiones solo si los jugadores existen
    if (players && players[0] && boxes) {
      recolectables.addColliders(players, boxes);
    } else {
      console.warn("⚠️ Factory: jugadores o cajas no definidos al crear recolectables.");
    }

    return recolectables;
  }
}
