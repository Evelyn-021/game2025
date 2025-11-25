import { Scene } from "phaser";
import Player from "../../classes/player.js";
import { GameState } from "../state/GameState.js";
import { events } from "../../classes/GameEvents.js";
import AudioManager from "../../systems/AudioManager.js";
import DamageSystem from "../../systems/DamageSystem.js";
import { ServiceLocator } from "../../systems/ServiceLocator.js";
import Factory from "../../systems/Factory.js";
import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";
import Combo from "../../classes/combo.js";


export class Game extends Scene {
  constructor() {
    super("Game");

 this.wrapTiles = [];


  }

  create() {


    // === MÚSICA DE FONDO DEL JUEGO ===
    // Asegurarse de que la música del menú esté detenida
    if (this.sound.get("menu")?.isPlaying) {
      this.sound.get("menu").stop();
    }
    
    // Iniciar música del juego
    this.gameMusic = this.sound.add("game", { 
      volume: 0.25,  // Volumen moderado (25%)
      loop: true 
    });
    this.gameMusic.play();




    // =====================================================
    // SISTEMA DE ENTRADA GLOBAL
    // =====================================================
    this.inputSystem = new InputSystem(this.input);

    // --- Player 1 ---
    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
        [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
        [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.E],
        [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.Q],
      },
      "player1"
    );

    // --- Player 2 ---
    this.inputSystem.configureKeyboard(
      {
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
        [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO],
        [INPUT_ACTIONS.EAST]: [Phaser.Input.Keyboard.KeyCodes.ENTER],
        [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.M],
      },
      "player2"
    );

    // =====================================================
    // SISTEMAS GLOBALES
    // =====================================================
    this.audioManager = new AudioManager(this);
    this.audioManager.add("collect");
    this.audioManager.add("respawn");
    this.audioManager.add("salud");
    this.audioManager.add("bitemonster");
    this.audioManager.add("daño");

    this.damageSystem = new DamageSystem(this, this.audioManager);

    ServiceLocator.register("audio", this.audioManager);
    ServiceLocator.register("damage", this.damageSystem);

    // =====================================================
    // CREAR MUNDO: MAPA + PARALLAX + CAJAS
    // =====================================================
    this.setupWorld();

    
    // =====================================================
    // CONFIGURACIÓN DE FÍSICA - PERMITIR SALIR DE LÍMITES PARA WRAP
    // =====================================================
    this.physics.world.gravity.y = 800;
    
    // 🔄 IMPORTANTE: Permitir salir de los límites para el wrap
    this.physics.world.setBounds(
        0, 
        0, 
        this.map.widthInPixels, 
        this.map.heightInPixels, 
        false,  // ← NO colisionar con izquierda
        false,  // ← NO colisionar con derecha  
        true,   // ← SÍ colisionar con arriba
        false   // ← NO colisionar con abajo (para caer)
    );



    // =====================================================
    // CREAR JUGADORES
    // =====================================================
    const char1 = GameState.player1.character || "Pinky";
    const char2 = GameState.player2.character || "Lamb";

    console.log('🔍 GameState - J1:', GameState.player1.character, 'J2:', GameState.player2.character);

    this.player1 = new Player(this, this.spawn1.x, this.spawn1.y, char1, 1);
    this.player2 = new Player(this, this.spawn2.x, this.spawn2.y, char2, 2);

    // 🔄 INICIALIZAR PROPIEDAD DE WRAP
    this.player1.isWrapping = false;
    this.player2.isWrapping = false;
    // === COMBOS ===
    this.combo1 = new Combo(this, this.player1);
    this.combo2 = new Combo(this, this.player2);




    // Configurar físicas de jugadores
    this.player1.body.setGravityY(300);
    this.player2.body.setGravityY(300);
    this.player1.body.setCollideWorldBounds(true);
    this.player2.body.setCollideWorldBounds(true);

    // =====================================================
    // COLISIONES
    // =====================================================
    this.physics.add.collider(this.player1, this.plataformas);
    this.physics.add.collider(this.player2, this.plataformas);

    // =====================================================
    // RECOLECTABLES
    // =====================================================
    const players = [this.player1, this.player2];
    const boxes = GameState.mode === "versus" ? [this.caja1, this.caja2] : [this.cajaCoop];

    this.recolectables = Factory.createRecolectables(
      this,
      this.objetosMapa,
      players,
      boxes
    );

    // =====================================================
    // ENEMIGOS
    // =====================================================
    const enemyObjects = this.map.getObjectLayer("enemigos")?.objects || [];
    this.enemies = Factory.createEnemies(this, enemyObjects, [this.player1, this.player2], this.audioManager);

    // Colisiones de enemigos con plataformas
    this.enemies.forEach(e => {
      this.physics.add.collider(e, this.plataformas);
    });

    // =====================================================
    // SISTEMA DE DAÑO - ENEMIGOS A JUGADORES
    // =====================================================
    this.enemies.forEach(enemy => {
      this.physics.add.overlap(this.player1, enemy, () => {
        this.handleEnemyCollision(this.player1, enemy);
      });
      
      this.physics.add.overlap(this.player2, enemy, () => {
        this.handleEnemyCollision(this.player2, enemy);
      });
    });

      // =====================================================
    // ESCUCHAR EVENTOS
    // =====================================================
    events.on("player-dead", ({ player, playerID }) => {
      console.log(`📢 Evento player-dead recibido: Jugador ${playerID}`);
      this.handlePlayerDeath(player, playerID);
    });

   events.on("dona-recolectada", (playerId) => {
  if (playerId === 1) GameState.player1.donasRecolectadas++;
  if (playerId === 2) GameState.player2.donasRecolectadas++;
  
  // 🎯 VERIFICACIÓN DIRECTA DE META - SOLO COOP
  if (GameState.mode === "coop") {
    const p1 = GameState.player1.donasRecolectadas || 0;
    const p2 = GameState.player2.donasRecolectadas || 0;
    const teamScore = p1 + p2;
    const meta = GameState.metaDonas;
    
    if (teamScore >= meta) {
      console.log(`🎉 ¡Meta alcanzada! ${teamScore}/${meta} donas`);
      
      const tiempo = this.scene.get("HUDScene")?.timeLeft ?? 0;
      
      // 📦 MOVER CAJA A LA SIGUIENTE POSICIÓN
      GameState.nextBoxPosition();
      
      // Detener el juego inmediatamente
      this.scene.stop("HUDScene");
      
      // Ir a VictoryScene
      this.scene.start("VictoryScene", {
        winner: "TEAM",
        p1,
        p2,
        tiempo,
      });
      
      // Aumentar meta para la próxima ronda
      GameState.metaDonas += 5;
    }
  }
});

    // 🍒 Nuevo evento para cuando se recupera vida con cerezas
    events.on("vida-recuperada", ({ playerID, sharedLives }) => {
      console.log(`🍒 Jugador ${playerID} recuperó vida! Vidas: ${sharedLives}`);
      // Esto actualizará automáticamente el HUD si ya estás escuchando cambios en sharedLives
    });

    // =============================================================
    // EVENTO: ATAQUE DEL JUGADOR
    // =============================================================
    events.on("player-attack", (data) => {
      this.checkPlayerAttack(data);
    });


    // =====================================================
    // HUD
    // =====================================================
    this.scene.launch("HUDScene");

    // =====================================================
    // LÓGICA DE ESCALERAS - CORREGIDA
    // =====================================================
    this.addClimbLogic(this.player1, "player1");
    this.addClimbLogic(this.player2, "player2");

    // =====================================================
    // MODO DE JUEGO
    // =====================================================
    if (GameState.mode === "versus") this.initVersus();
    if (GameState.mode === "coop") this.initCoop();

    // =====================================================
    // FIN DE TIEMPO
    // =====================================================
    events.on("time-up", () => {
  const p1 = GameState.player1.donasRecolectadas || 0;
  const p2 = GameState.player2.donasRecolectadas || 0;
  const teamScore = p1 + p2;
  const tiempo = this.scene.get("HUDScene")?.timeLeft ?? 0;

  this.scene.stop("HUDScene");

  // =====================================================
  // 🟣 MODO COOP — META DINÁMICA
  // =====================================================
  if (GameState.mode === "coop") {

    const meta = GameState.metaDonas;

    if (teamScore >= meta) {
      // ⭐ Alcanzaron la meta → Victoria inmediata
      
      // 📦 MOVER CAJA A LA SIGUIENTE POSICIÓN
      GameState.nextBoxPosition();
      
      // Aumentar la meta para la próxima ronda
      GameState.metaDonas += 5;
      
      this.scene.start("VictoryScene", {
        winner: "TEAM",
        p1,
        p2,
        tiempo,
      });
      
    } else {
      // ❌ No alcanzaron la meta → Derrota
      this.scene.start("GameOver", {
        winner: "TEAM",
        p1,
        p2,
        tiempo,
        motivo: "no alcanzaron la meta",
      });
    }

    return;
  }
  // =====================================================
  // 🟥 MODO VERSUS (igual que siempre)
  // =====================================================
  if (p1 === p2) {
    this.scene.start("EmpateScene", { p1, p2, tiempo });
  } else {
    const winner = p1 > p2 ? "Jugador 1" : "Jugador 2";
    this.scene.start("VictoryScene", { winner, p1, p2, tiempo });
  }
});

    // =====================================================
    // LIMPIEZA
    // =====================================================
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      // Detener música del juego al cerrar la escena
      if (this.gameMusic && this.gameMusic.isPlaying) {
        this.gameMusic.stop();
      }
      
      ServiceLocator.clear();
      events.off("player-dead");
      events.off("time-up");
    });
  }

  // ============================================================
  //  WORLD — MAPA + PARALLAX + CAJAS
  // ============================================================
  setupWorld() {
    const mode = GameState.mode;
    const { width, height } = this.scale;

    // ===== MAPA =====
    const mapConfig = mode === "coop" 
      ? {
          sueloKey: "suelo2",
          sueloImg: "wip5", 
          escaleraKey: "escalera2",
          escaleraImg: "escalera"
        }
      : {
          sueloKey: "suelo",
          sueloImg: "wip4",
          escaleraKey: "escalera", 
          escaleraImg: "escalera"
        };

    const { map, plataformas, escaleras, fondo } = Factory.createMap(
      this,
      mode === "coop" ? "map2" : "map",
      mapConfig
    );

    this.map = map;
    this.plataformas = plataformas;
    this.escaleras = escaleras;
    this.fondoLayer = fondo;

    // 🟪 Buscar tiles marcados como WRAP en Tiled - MEJORADO
    this.wrapTiles = [];
    this.plataformas.forEachTile(tile => {
        if (tile && tile.index !== -1) {
            // Verificar propiedades del tile
            const properties = this.map.tilesets[0].tileProperties || {};
            const tileProperties = properties[tile.index - 1] || {};
            
            if (tileProperties.wrap === true) {
                this.wrapTiles.push({
                    pixelX: tile.pixelX,
                    pixelY: tile.pixelY,
                    width: this.map.tileWidth,
                    height: this.map.tileHeight,
                    getBounds: function() {
                        return new Phaser.Geom.Rectangle(
                            this.pixelX, 
                            this.pixelY, 
                            this.width, 
                            this.height
                        );
                    }
                });
                console.log(`📍 Tile WRAP encontrado en: (${tile.pixelX}, ${tile.pixelY})`);
            }
        }
    });

    console.log(`🎯 Total de tiles WRAP: ${this.wrapTiles.length}`);

    // ===== OBJETOS =====
    this.objetosMapa = map.getObjectLayer("objetos")?.objects || [];
    this.spawn1 = this.objetosMapa.find((o) => o.name === "player") || { x: 200, y: 200 };
    this.spawn2 = this.objetosMapa.find((o) => o.name === "player2") || { x: 500, y: 200 };

    // ===== PARALLAX =====
    const { layers, stars } = Factory.createParallax(this, mode, width, height);
    
    // 🔴 SEPARAR nubes lilas del sistema de parallax
    this.bgLayers = layers.filter(layer => layer.texture?.key !== "cloudysky");
    this.staticCloud = layers.find(layer => layer.texture?.key === "cloudysky");

    // 🟠 HACER LA NUBE ROSA FRONTAL MÁS ANCHA
    const pinkFront = this.bgLayers.find(layer => 
        layer.texture?.key === "cake_valley_cotton-candy-front"
    );
    if (pinkFront) {
        // Hacer la textura más ancha (por ejemplo, 1.8 veces en lugar de 1.4)
        pinkFront.displayWidth = width * 1.8;
        pinkFront.displayHeight = pinkFront.height;
        console.log("🟠 Nube rosa frontal extendida para cubrir mejor los costados");
    }

    // Guardar posición original solo de las capas dinámicas
    this.bgLayers.forEach(layer => {
        layer.originalX = layer.x;
        layer.originalY = layer.y;
    });

    this.bgStars = stars;

    // ⭐ Configurar viento para nubes rosas, amarillas Y nubes lilas
    if (GameState.mode === "versus") {
        const nubesAmarillas = this.bgLayers.find(layer => layer.texture?.key === "cake_valley_yellow-clouds");
        const nubesRosasMiddle = this.bgLayers.find(layer => 
            layer.texture?.key === "cake_valley_cotton-candy-middle");
        const nubesRosasFront = this.bgLayers.find(layer => 
            layer.texture?.key === "cake_valley_cotton-candy-front");

        // Nubes lilas (si están en staticCloud)
        if (this.staticCloud) {
            this.staticCloud.windPhase = Math.random() * 1000;
        }

        // Nubes amarillas
        if (nubesAmarillas) {
            nubesAmarillas.baseY = nubesAmarillas.y;
            nubesAmarillas.windPhase = Math.random() * 1000;
        }
        
        // Nubes rosas
        if (nubesRosasMiddle && nubesRosasFront) {
            nubesRosasMiddle.baseY = nubesRosasMiddle.y;
            nubesRosasFront.baseY = nubesRosasFront.y;
            nubesRosasMiddle.windPhase = Math.random() * 1000;
            nubesRosasFront.windPhase = Math.random() * 1000;
        }
    }

    // ===== CAJAS =====
    if (mode === "versus") {
        [this.caja1, this.caja2] = Factory.createBoxes(this, this.objetosMapa);
    } else {
        this.cajaCoop = Factory.createSharedBox(this, this.spawn1, this.objetosMapa);
    }

    // ===== CÁMARA =====
    const cam = this.cameras.main;
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Deadzone para mejor seguimiento
    cam.setDeadzone(
        this.scale.width * 0.45,
        this.scale.height * 0.40
    );
}

  // =============================================================
  // MODO VERSUS
  // =============================================================
  initVersus() {
    GameState.player1.donasRecolectadas = 0;
    GameState.player2.donasRecolectadas = 0;

    this.physics.add.collider(this.player1, this.player2, () => {
      const diff = this.player1.x - this.player2.x;
      if (diff > 0) {
        this.player1.x += 5;
        this.player2.x -= 5;
      } else {
        this.player1.x -= 5;
        this.player2.x += 5;
      }
    });

    const hud = this.scene.get("HUDScene");
    if (hud) hud.events.once("time-up", () => events.emit("time-up"));
  }

  // =============================================================
  // MODO COOP
  // =============================================================
  initCoop() {
    
  }

 // =============================================================
// LÓGICA DE ESCALERAS - MÉTODO ORIGINAL FUNCIONANDO
// =============================================================
addClimbLogic(player, playerKey) {
  player.isClimbing = false;

  // Convertimos las escaleras en un array de tiles
  let escalerasTiles = [];
  this.escaleras.forEachTile(tile => {
    if (tile && tile.index !== -1) {
      escalerasTiles.push(tile);
    }
  });

  this.events.on("update", () => {
    if (!player || !player.body || !player.active) return;

    const playerBounds = player.getBounds();

    // 🎯 SOLO detecta escalera si el jugador está centrado horizontalmente en ella
    const onLadder = escalerasTiles.some(tile => {
      const t = tile.getBounds();

      const overlap = Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, t);

      // condición extra: jugador debe estar más o menos alineado
      const aligned =
        Math.abs(player.x - (t.x + t.width / 2)) < 14; // margen ajustable

      return overlap && aligned;
    });

    if (onLadder) {
      player.isClimbing = true;
      player.body.allowGravity = false;
      player.setVelocityY(0);

      const input = this.inputSystem;
      if (input.isPressed(INPUT_ACTIONS.UP, playerKey)) {
        player.y -= 3;
      } else if (input.isPressed(INPUT_ACTIONS.DOWN, playerKey)) {
        player.y += 3;
      }
    } else {
      if (player.isClimbing) {
        player.isClimbing = false;
        player.body.allowGravity = true;
      }
    }
  });
}
  // =============================================================
  // COLISIÓN CON ENEMIGOS - SISTEMA DE DAÑO
  // =============================================================
  handleEnemyCollision(player, enemy) {
    if (player.invulnerable || !player.active) return;

    // Aplicar daño al jugador
    ServiceLocator.get("damage").applyDamage(player, player.id);
    
    // Efecto de knockback
    const knockbackDirection = player.x < enemy.x ? -1 : 1;
    player.setVelocityX(200 * knockbackDirection);
    player.setVelocityY(-200);

    // Efecto visual de daño
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });

    // Hacer al jugador invulnerable temporalmente
    player.invulnerable = true;
    this.time.delayedCall(1000, () => {
      player.invulnerable = false;
    });
  }

  // =============================================================
  // HANDLER DE MUERTE
  // =============================================================
  handlePlayerDeath(player, id) {
    player.setActive(false).setVisible(false);
    player.body.enable = false;

    const p1 = GameState.player1.donasRecolectadas || 0;
    const p2 = GameState.player2.donasRecolectadas || 0;
    const tiempo = this.scene.get("HUDScene")?.timeLeft ?? 0;
    const winner = id === 1 ? "Jugador 2" : "Jugador 1";

    this.scene.stop("HUDScene");

    this.time.delayedCall(800, () => {
      this.scene.start("GameOver", {
        winner,
        p1,
        p2,
        tiempo,
        motivo: "sin vidas",
      });
    });
  }



// =============================================================
// WRAP SUAVE COMO DONUT DODO — SIN TILES, SIN MUERTE
// =============================================================
applyScreenWrap(player) {
    const w = this.physics.world.bounds;

    // --- GHOST TRAIL — función lista para usar ---
    const makeGhost = () => {
        const ghost = this.add.sprite(player.x, player.y, player.texture.key)
            .setFrame(player.frame.name)   // ✨ mantiene el frame actual
            .setAlpha(0.6)
            .setDepth(999);

        this.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: 150,
            onComplete: () => ghost.destroy()
        });
    };

    // Cruza por la izquierda → aparece derecha
    if (player.x < w.left) {
        makeGhost();                     // 👻 sombra antes del warp
        player.x = w.right - 2;
        makeGhost();                     // 👻 sombra después del warp
        return;
    }

    // Cruza por la derecha → aparece izquierda
    if (player.x > w.right) {
        makeGhost();                     // 👻 sombra antes del warp
        player.x = w.left + 2;
        makeGhost();                     // 👻 sombra después del warp
        return;
    }
}



  // =============================================================
// LOOP DE UPDATE
// =============================================================
update() {

 // ⭐ Wrap solo en plataformas especiales
  this.applyScreenWrap(this.player1);
  this.applyScreenWrap(this.player2);





  // =========================================================
  // MOVIMIENTO PLAYER 1
  // =========================================================
  if (!this.player1.isClimbing) {
    if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT, "player1")) this.player1.moveLeft();
    else if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, "player1")) this.player1.moveRight();
    else this.player1.stopMoving();
  }

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH, "player1"))
    this.player1.jump();

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player1"))
    this.player1.collect();


  // =========================================================
  // ATAQUE PLAYER 1
  // =========================================================
  // COOP → ataca enemigos
  // VERSUS → ataca al otro jugador
  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player1")) {
    if (GameState.mode === "coop") this.player1.attack();
    if (GameState.mode === "versus") this.player1.attack();
  }



  // =========================================================
  // MOVIMIENTO PLAYER 2
  // =========================================================
  if (!this.player2.isClimbing) {
    if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT, "player2")) this.player2.moveLeft();
    else if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT, "player2")) this.player2.moveRight();
    else this.player2.stopMoving();
  }

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.NORTH, "player2"))
    this.player2.jump();

  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.EAST, "player2"))
    this.player2.collect();



  // =========================================================
  // ATAQUE PLAYER 2
  // =========================================================
  if (this.inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH, "player2")) {
    if (GameState.mode === "coop") this.player2.attack();
    if (GameState.mode === "versus") this.player2.attack();
  }



  // =========================================================
  // RESTAURAR GRAVEDAD CUANDO NO ESCALAN
  // =========================================================
  if (!this.player1.isClimbing && !this.player1.body.allowGravity) {
    this.player1.body.allowGravity = true;
  }
  if (!this.player2.isClimbing && !this.player2.body.allowGravity) {
    this.player2.body.allowGravity = true;
  }



  // =========================================================
  // UPDATE DE PERSONAJES + COMBOS
  // =========================================================
  this.player1.update();
  this.player2.update();
  this.combo1.update();
  this.combo2.update();



  // =========================================================
  // UPDATE ENEMIGOS
  // =========================================================
  this.enemies.forEach(e => e.update?.());



  // =========================================================
  // ATAQUE A ENEMIGOS SOLO EN COOP
  // =========================================================
  if (GameState.mode === "coop") {
    this.enemies.forEach(enemy => {
      enemy.checkPlayerHit(this.player1);
      enemy.checkPlayerHit(this.player2);
    });
  }




    // CÁMARA DINÁMICA
    const cam = this.cameras.main;
    const cx = (this.player1.x + this.player2.x) / 2;
    const cy = (this.player1.y + this.player2.y) / 2;
    const lerp = 0.08;

    cam.scrollX += (cx - cam.midPoint.x) * lerp;
    cam.scrollY += (cy - cam.midPoint.y) * lerp;

    // ZOOM DINÁMICO
    const distX = Math.abs(this.player1.x - this.player2.x);
    const distY = Math.abs(this.player1.y - this.player2.y);
    const dist = Math.max(distX, distY);

    const targetZoom = Phaser.Math.Clamp(1.2 - dist / 1200, 0.85, 1.2);
    cam.zoom = Phaser.Math.Linear(cam.zoom, targetZoom, 0.05);

 // =========================================================
  // PARALLAX - CORREGIDO
  // =========================================================
  const vw = this.scale.width / cam.zoom;
  const vh = this.scale.height / cam.zoom;
  const ox = cam.midPoint.x;
  const oy = cam.midPoint.y;

  // 🔴 NUBES LILAS - ESCALADO FIJO (fuera del bucle)
if (this.staticCloud) {
  this.staticCloud.displayWidth = vw * 1.4;
  this.staticCloud.displayHeight = this.staticCloud.height;


// Mantener fija la altura
this.staticCloud.y = 50;

// Movimiento horizontal suave
this.staticCloud.x =
  this.scale.width / 2 +
  Math.sin(this.time.now * 0.0007 + (this.staticCloud.windPhase || 0)) * 12;






}
  // 🔴 SOLO procesar capas dinámicas (excluyendo nubes lilas)
  this.bgLayers.forEach(layer => {
    const key = layer.texture.key;

  // 💛 Movimiento de nubes amarillas (ahora son IMAGE)
  if (layer.isYellowCloud) {
    layer.x =
      ox + Math.sin(this.time.now * 0.001 + layer.windPhase) * 16;

    layer.y = layer.baseY;

    return; // muy importante
  }



// ⭐ Movimiento horizontal SOLAMENTE (como nubes rosas)
if (
  GameState.mode === "versus" &&
  (key === "cake_valley_cotton-candy-middle" ||
   key === "cake_valley_cotton-candy-front" ||
   key === "cake_valley_yellow-clouds")
) {
  let amplitudeX, speedX;
  
  switch(key) {
    case "cake_valley_cotton-candy-middle":
    case "cake_valley_cotton-candy-front":
      amplitudeX = 20;
      speedX = 0.0012;
      break;

    case "cake_valley_yellow-clouds":
      amplitudeX = 16;
      speedX = 0.0010;
      break;
  }



  // 👉 SOLO OSCILACIÓN HORIZONTAL
if (layer.isYellowCloud) {


  // ⭐ TILESPRITE → su movimiento es tilePositionX
  layer.tilePositionX =
    Math.sin(this.time.now * speedX + layer.windPhase) * amplitudeX;

  layer.x = ox;            // fija su posición en cámara
  layer.y = layer.baseY;   // no se mueve para arriba/abajo

} else {

  // ⭐ ROSAS (middle/front) → movimiento normal
  layer.x =
    ox + Math.sin(this.time.now * speedX + layer.windPhase) * amplitudeX;

  layer.y = layer.baseY;
}



  // 👉 Mantener su Y fija SIEMPRE
  layer.y = layer.baseY;
}

    // ⭐ ESCALADO para capas dinámicas
    const isPink =
  key === "cake_valley_cotton-candy-middle" ||
  key === "cake_valley_cotton-candy-front" ||
  key === "cake_valley_yellow-clouds";

// ❗ NO ESCALAR TORRES NI NUBE AMARILLA
if (layer.isTower || layer.isYellowCloud || layer.isCandyBack) {
    return;
}

    if (isPink) {
      layer.displayWidth = vw * 1.4;
      layer.displayHeight = layer.height;
    } else {
      layer.displayWidth = vw * 1.4;
      layer.displayHeight = vh * 1.4;
    }
  });

  // ⭐ STARS
  this.bgStars.x = ox;
  this.bgStars.y = oy;
  this.bgStars.displayWidth = vw * 1.6;
  this.bgStars.displayHeight = vh * 1.6;
  this.bgStars.tilePositionX += 0.4;

    // CAÍDA DEL MUNDO - SOLO si no está en modo wrap
    const worldH = this.physics.world.bounds.height;
    const wrapMargin = 200; // Margen más grande para permitir wrap

  // 🚫 Bloquear muerte por caída si está realizando WRAP
    const doingWrap = this.player1.isWrapping || this.player2.isWrapping;

    // 🚫 Si está haciendo WRAP → jamás puede morir
if (this.player1.isWrapping) return;
if (this.player2.isWrapping) return;

// 👉 muerte real por caída
if (this.player1.y > worldH + wrapMargin && !this.player1.invulnerable) {
    this.playerDied(this.player1, 1);
}
if (this.player2.y > worldH + wrapMargin && !this.player2.invulnerable) {
    this.playerDied(this.player2, 2);
}

}
  // =============================================================
// MUERTE Y RESPAWN - VERSUS / COOP 100% ARREGLADO
// =============================================================
playerDied(player, id) {

  if (!player.active || player.invulnerable) return;

  console.log(`💀 playerDied - Jugador ${id}`);

  // ============================================================
// 🟦 MODO COOP — VIDAS COMPARTIDAS
// ============================================================
if (GameState.mode === "coop") {

  // 👉 Aplicar daño correctamente usando el DamageSystem
  ServiceLocator.get("damage").applyDamage(player, id);

  // Si ya no hay vidas → Game Over
  if (GameState.sharedLives <= 0) {
    this.handlePlayerDeath(player, id);
    return;
  }

  // Respawn
  const spawn = id === 1 ? this.spawn1 : this.spawn2;

  player.invulnerable = true;
  player.body.enable = false;
  player.setVisible(false);

  this.time.delayedCall(120, () => {
    player.setPosition(spawn.x, spawn.y);
    player.setVelocity(0, 0);

    player.setVisible(true);
    player.body.enable = true;

    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 120,
      repeat: 8,
      yoyo: true,
      onComplete: () => {
        player.alpha = 1;
        player.invulnerable = false;
      }
    });

    this.audioManager.play("respawn");
  });

  return;
}



  // ============================================================
  // 🟥 MODO VERSUS — VIDAS INDIVIDUALES
  // ============================================================
  const key = id === 1 ? "player1" : "player2";
  const st = GameState[key];

  // si todavía tiene más vidas → respawn normal
  if (st.lives > 1) {

    // aplicar daño con el sistema
    ServiceLocator.get("damage").applyDamage(player, id);

    const spawn = id === 1 ? this.spawn1 : this.spawn2;

    player.setVisible(false);
    player.body.enable = false;

    this.time.delayedCall(100, () => {
      player.setVisible(true);
      player.body.enable = true;
      player.setPosition(spawn.x, spawn.y);
      player.setVelocity(0, 0);

      this.tweens.add({
        targets: player,
        alpha: 0.3,
        duration: 120,
        repeat: 8,
        yoyo: true,
        onComplete: () => {
          player.alpha = 1;
          player.invulnerable = false;
        }
      });

      this.audioManager.play("respawn");
    });

    return;
  }

  // sin vidas → muerte total
  st.lives = 0;
  this.handlePlayerDeath(player, id);
}


// =============================================================
// ATAQUE DEL JUGADOR CONTRA ENEMIGOS
// =============================================================
checkPlayerAttack({ player, x, y, range, width, direction, id }) {

  // 🔥 Usa el attackRange REAL del player
  const realRange = range; // 40px (según Player.js)
  const attackX = x + direction * realRange;

  // 🎯 HITBOX PRECISA (solo torso adelante del jugador)
  const hitbox = new Phaser.Geom.Rectangle(
    attackX - realRange / 2,
    y - player.height * 0.4,     // más chico verticalmente
    realRange,
    player.height * 0.8
  );

  // =============================================================
  // ATAQUE A ENEMIGOS (COOP)
  // =============================================================
  this.enemies.forEach(enemy => {
    if (!enemy.active) return;

    if (Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), hitbox)) {
      ServiceLocator.get("damage").applyDamageToEnemy(enemy, player.id);
      enemy.setTint(0xffaaaa);
      this.time.delayedCall(150, () => enemy.clearTint());
    }
  });

  // =============================================================
  // ATAQUE ENTRE JUGADORES (VERSUS)
  // =============================================================
  if (GameState.mode === "versus") {
    const target = (id === 1) ? this.player2 : this.player1;

    if (target.active && !target.invulnerable) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(target.getBounds(), hitbox)) {
        ServiceLocator.get("damage").applyDamage(target, target.id);

        target.setTint(0xffaaaa);
        this.time.delayedCall(150, () => target.clearTint());
      }
    }
  }
}


}