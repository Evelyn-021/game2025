import Recolectables from "../classes/recolectables.js";
import Enemy from "../classes/Enemy.js";

export default class Factory {
  /**
   * 🌍 Crea el tilemap y sus capas principales.
   * @param {Phaser.Scene} scene - Escena actual
   * @param {string} mapKey - Nombre del mapa en el preload
   * @param {Object} tilesetConfig - Configuración de tilesets
   * @returns {Object} { map, plataformas, escaleras, fondo }
   */
  static createMap(scene, mapKey, tilesetConfig = {}) {
    const map = scene.make.tilemap({ key: mapKey });

    // Usar configuración proporcionada o valores por defecto
    const sueloKey = tilesetConfig.sueloKey || "suelo";
    const sueloImg = tilesetConfig.sueloImg || "tiles";
    const escaleraKey = tilesetConfig.escaleraKey || "escalera";
    const escaleraImg = tilesetConfig.escaleraImg || "escalera";

    const sueloSet = map.addTilesetImage(sueloKey, sueloImg);
    const escaleraSet = map.addTilesetImage(escaleraKey, escaleraImg);

    // Capa de fondo
    const fondo = map.createLayer("Fondo", sueloSet, 0, 0);
    if (fondo) fondo.setDepth(-1);

    // Capa principal de plataformas
    const plataformas = map.createLayer("plataformas", sueloSet, 0, 0);
    if (plataformas) {
      plataformas.setCollisionByProperty({ esColisionable: true });
    }

    // ✅ CORREGIDO: Mantener escaleras como TilemapLayer funcional
    const escaleras = map.createLayer("usables", escaleraSet, 0, 0);

    return { map, plataformas, escaleras, fondo };
  }

  /**
   * 🌌 Crea sistema de parallax para el fondo
   * @param {Phaser.Scene} scene - Escena actual
   * @param {string} mode - Modo de juego ("versus" o "coop")
   * @param {number} width - Ancho de pantalla
   * @param {number} height - Alto de pantalla
   * @returns {Object} { layers, stars }
   */
  static createParallax(scene, mode, width, height) {
    if (mode === "coop") {
      return {
        layers: [
          scene.add.image(0, 0, "background3").setOrigin(0).setScrollFactor(0).setDepth(-10),
          scene.add.tileSprite(0, 0, width, height, "nubelila1").setOrigin(0).setScrollFactor(0).setDepth(-9),
          scene.add.tileSprite(0, 0, width, height, "nubelila2").setOrigin(0).setScrollFactor(0).setDepth(-8),
        ],
        stars: scene.add.tileSprite(0, 0, width, height, "nubeparallax").setOrigin(0).setScrollFactor(0).setDepth(-7),
      };
    }

    // Versus
    return {
      layers: [
        scene.add.image(0, 0, "background2").setOrigin(0.5).setScrollFactor(0).setDepth(-6),
        scene.add.image(0, 0, "cake_valley_yellow-clouds").setOrigin(0.5).setScrollFactor(0).setDepth(-5),
        scene.add.image(0, 0, "cake_valley_cotton-candy-middle").setOrigin(0.5).setScrollFactor(0).setDepth(-4),
        scene.add.image(0, 0, "cake_valley_cotton-candy-front").setOrigin(0.5).setScrollFactor(0).setDepth(-3),
      ],
      stars: scene.add.tileSprite(0, 0, width, height, "cake_valley_sugar-stars").setOrigin(0.5).setScrollFactor(0).setDepth(-2),
    };
  }

  /**
   * 📦 Crea y configura las cajas del nivel.
   * @param {Phaser.Scene} scene - Escena actual
   * @returns {Array} [caja1, caja2]
   */
  static createBoxes(scene) {
    const caja1 = scene.physics.add.sprite(120, 560, "caja").setScale(1.1);
    const caja2 = scene.physics.add.sprite(960, 560, "caja").setScale(1.1);

    [caja1, caja2].forEach(c => {
      c.setImmovable(true);
      c.body.allowGravity = false;
    });

    return [caja1, caja2];
  }

  /**
   * 📦 Crea caja compartida para modo coop
   * @param {Phaser.Scene} scene - Escena actual
   * @param {Object} spawn - Posición de spawn
   * @returns {Phaser.Physics.Arcade.Sprite} caja
   */
  static createSharedBox(scene, spawn) {
    const caja = scene.physics.add.sprite(spawn.x, spawn.y, "caja").setScale(1.2);
    caja.setImmovable(true);
    caja.body.allowGravity = false;
    return caja;
  }

  /**
   * 🍩 Crea los objetos recolectables del nivel
   * @param {Phaser.Scene} scene - Escena actual
   * @param {Array} objetosMapa - Objetos del mapa (Tiled)
   * @param {Array} players - Jugadores activos [player1, player2]
   * @param {Array} boxes - Cajas físicas
   * @returns {Recolectables}
   */
  static createRecolectables(scene, objetosMapa, players, boxes = []) {
    const recolectables = new Recolectables(scene, objetosMapa);
    
    // Agrega colisiones solo si los jugadores existen
    if (players && players.length > 0) {
      recolectables.addColliders(players, boxes);
    } else {
      console.warn("⚠️ Factory: jugadores no definidos al crear recolectables.");
    }

    return recolectables;
  }

  /**
   * 🧟 Crea enemigos del mapa
   * @param {Phaser.Scene} scene - Escena actual
   * @param {Array} enemyObjects - Objetos de enemigos del mapa
   * @param {Array} players - Jugadores [player1, player2]
   * @param {AudioManager} audioManager - Manager de audio
   * @returns {Array} Array de enemigos
   */
  static createEnemies(scene, enemyObjects, players = [], audioManager = null) {
    return enemyObjects.map((obj) => {
      const tipo = obj.properties?.find(p => p.name === "tipo")?.value || 
                   obj.type || 
                   obj.name || 
                   "bear";

      const enemy = new Enemy(
        scene, 
        obj.x, 
        obj.y, 
        tipo, 
        tipo,
        players, 
        audioManager
      );

      return enemy;
    });
  }
}