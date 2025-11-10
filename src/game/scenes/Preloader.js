import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    // Fondo durante la carga
    this.add.rectangle(512, 384, 1024, 768, 0x1a0033);

    // Marco del progreso
    this.border = this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    // Barra de progreso (relleno)
    this.bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    // Actualiza la barra a medida que se cargan los recursos
    this.load.on('progress', (progress) => {
      this.bar.width = 4 + (460 * progress);
    });
  }

  preload() {
    // === MENU ===
    this.load.image('logo', 'assets/image/menu/logo.png');
    this.load.image('background', 'assets/image/menu/background.png');

    // === TILEMAP ===
    this.load.image('tiles', 'assets/tilemap/wip4.png');          // Tileset del suelo
    this.load.image('escalera', 'assets/tilemap/escalera.png');   // Tileset de escaleras
    this.load.tilemapTiledJSON('map', 'assets/tilemap/map.json'); // Mapa con ambas capas

    // === PARALLAX ===
   this.load.image("background2", "assets/image/escenario/background2.png");
    this.load.image("cake_valley_yellow-clouds", "assets/image/escenario/cake_valley_yellow-clouds.png");
    this.load.image("cake_valley_cotton-candy-middle", "assets/image/escenario/cake_valley_cotton-candy-middle.png");
    this.load.image("cake_valley_cotton-candy-front", "assets/image/escenario/cake_valley_cotton-candy-front.png");
    this.load.image("cake_valley_sugar-stars", "assets/image/escenario/cake_valley_sugar-stars.png");
    
    //PERSONAJES
    this.load.atlas('Pinky', 'assets/image/personajes/Pinky.png', 'assets/image/personajes/Pinky.json');
    this.load.atlas('Lamb', 'assets/image/personajes/Lamb.png', 'assets/image/personajes/Lamb.json');

   
    // === ENEMIGOS ===
    this.load.atlas('bear', 'assets/image/enemigos/bear.png', 'assets/image/enemigos/bear.json');
    this.load.atlas('ooze', 'assets/image/enemigos/ooze.png', 'assets/image/enemigos/ooze.json');

    // === SELECCIÓN DE PERSONAJES ===
    this.load.atlas('SelectPinky', 'assets/image/personajes/SelectPinky.png', 'assets/image/personajes/SelectPinky.json');
    this.load.atlas('SelectLamb', 'assets/image/personajes/SelectLamb.png', 'assets/image/personajes/SelectLamb.json');

    // === SELECTOR DE MODO ===
    this.load.image('SelectVersus', 'assets/image/personajes/SelectVersus.png');
    this.load.image('SelectCoop', 'assets/image/personajes/SelectCoop.png');

    // === FLECHAS COMBO ===
    this.load.image("flecha1", "assets/image/personajes/flecha1.png");
    this.load.image("flecha2", "assets/image/personajes/flecha2.png");
    this.load.image("flecha3", "assets/image/personajes/flecha3.png");
    this.load.image("flecha4", "assets/image/personajes/flecha4.png");

    // === OBJETOS ===
    this.load.image('donas', 'assets/image/personajes/donas.png');
    this.load.image('donas2', 'assets/image/personajes/donas2.png');
    this.load.image('caja', 'assets/image/personajes/caja.png');

      // === SALUD ===
      this.load.spritesheet('health', 'assets/image/personajes/health.png', {
        frameWidth: 32,
        frameHeight: 32,
      });

    // === SONIDOS ===
    this.load.audio("collect", "assets/audio/collect.wav");
    this.load.audio("respawn", "assets/audio/respawn.wav");
    this.load.audio("salud", "assets/audio/salud.wav");
    this.load.audio("bitemonster", "assets/audio/bitemonster.mp3");
    this.load.audio("daño", "assets/audio/daño.mp3");

  }

  create() {
    // Eliminar la barra y el marco antes de pasar a la siguiente escena
    this.bar.destroy();
    this.border.destroy();

    // Pequeño retraso antes de pasar al menú (opcional)
    this.time.delayedCall(1000, () => {
      this.scene.start('MainMenu');
    });
  }
}
