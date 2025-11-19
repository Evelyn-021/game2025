import Recolectables from "../classes/recolectables.js";
import Enemy from "../classes/Enemy.js";
import { GameState } from "../game/state/GameState.js";
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

  // Tilesets REALES según tus archivos
  const sueloKey   = tilesetConfig.sueloKey   || "suelo";   // nombre en Tiled
  const sueloImg   = tilesetConfig.sueloImg   || "wip4";    // key cargada en preload

  const suelo2Key  = tilesetConfig.suelo2Key  || "suelo2";  // nombre en Tiled
  const suelo2Img  = tilesetConfig.suelo2Img  || "wip5";    // key cargada en preload

  const escaleraKey = tilesetConfig.escaleraKey || "escalera";
  const escaleraImg = tilesetConfig.escaleraImg || "escalera"; // si usás png propia cambiado esto

  // detectar cuál se usa según el mapa
  const isMap2 = (mapKey === "map2");

  const sueloSet = map.addTilesetImage(
    isMap2 ? suelo2Key : sueloKey,
    isMap2 ? suelo2Img : sueloImg
  );

  const escaleraSet = map.addTilesetImage(escaleraKey, escaleraImg);

  // Fondo
  const fondo = map.createLayer("Fondo", sueloSet, 0, 0);
  if (fondo) fondo.setDepth(-1);

  // PLATAFORMAS
  const plataformas = map.createLayer("plataformas", sueloSet, 0, 0);
  if (plataformas) {
    plataformas.setCollisionByProperty({ esColisionable: true });
  }

  // ESCALERAS
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

  const base = scene.add.tileSprite(
    width/2, height/2,
    width, height,
    "background3"
  ).setScrollFactor(0).setDepth(-10);

  const nube1 = scene.add.tileSprite(
    width/2, height/2,
    width, height,
    "nubelila1"
  ).setScrollFactor(0).setDepth(-9);

  const nube2 = scene.add.tileSprite(
    width/2, height/2,
    width, height,
    "nubelila2"
  ).setScrollFactor(0).setDepth(-8);

  const stars = scene.add.tileSprite(
    width/2, height/2,
    width, height,
    "nubeparallax"
  ).setScrollFactor(0).setDepth(-7);

  return { layers: [base, nube1, nube2], stars };
}

// Versus
const fondoPlano = scene.add.image(width / 2, height / 2, "background2")
  .setScrollFactor(0)
  .setDepth(-20);

// 1️⃣ NUBES LILAS (arriba) - COMO LAS NUBES ROSAS
const nubesLilas = scene.add.image(width / 2, 46, "cloudysky")
  .setScrollFactor(0)
  .setDepth(-19);


// 2️⃣ NUBES AMARILLAS
const nubesAmarillas = scene.add.tileSprite(width / 2, height / 2 - 20, width, height, "cake_valley_yellow-clouds")
  .setScrollFactor(0)
  .setDepth(-18);

// 3️⃣ MONTAÑAS (deben verse bien)
const montanas = scene.add.image(width / 2, height / 2 + 40, "cake_valley_mountains")
  .setScrollFactor(0)
  .setDepth(-17);

// 4️⃣ NUBES ROSAS — middle (tamaño original, SOLO abajo)
const nubesRosasMiddle = scene.add.image(width / 2, height / 2 + 250, "cake_valley_cotton-candy-middle")
  .setScrollFactor(0)
  .setDepth(-16);

// 5️⃣ NUBES ROSAS — front (tamaño original también)
const nubesRosasFront = scene.add.image(width / 2, height / 2 + 330, "cake_valley_cotton-candy-front")
  .setScrollFactor(0)
  .setDepth(-15);

// 6️⃣ ESTRELLAS (suaves)
const stars = scene.add.tileSprite(width / 2, height / 2 - 120, width, height, "cake_valley_sugar-stars")
  .setScrollFactor(0)
  .setDepth(-14);

return {
  layers: [
    fondoPlano,
    nubesLilas,
    nubesAmarillas,
    montanas,
    nubesRosasMiddle,
    nubesRosasFront,
  ],
  stars,
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
  //CREA ENEMIGOS
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
      // ⭐⭐ ACTIVAR DAÑO SOLO EN MODO COOP ⭐⭐
    if (scene.gameMode === "coop" || GameState.mode === "coop") {
      enemy.isCoopEnemy = true;
      enemy.setCoopProperties(3, 45); // vida y velocidad opcionales
    }

      return enemy;
    });
  }
}