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
    this.load.image('tiles', 'assets/tilemap/wip4.png');
    this.load.tilemapTiledJSON('map', 'assets/tilemap/map.json');
    //Parallax
    this.load.image('background2', 'assets/image/escenario/background2.png');

    // === PERSONAJES / SPRITES ===
    this.load.atlas('Pinky', 'assets/image/personajes/Pinky.png', 'assets/image/personajes/Pinky.json');
    this.load.atlas('Lamb', 'assets/image/personajes/Lamb.png', 'assets/image/personajes/Lamb.json');



    // Pantalla animada de selección de personajes
       this.load.atlas('SelectPinky', 'assets/image/personajes/SelectPinky.png', 'assets/image/personajes/SelectPinky.json');
        this.load.atlas('SelectLamb', 'assets/image/personajes/SelectLamb.png', 'assets/image/personajes/SelectLamb.json');


        //Selector de modo
        this.load.image('SelectVersus', 'assets/image/personajes/SelectVersus.png');
        this.load.image('SelectCoop', 'assets/image/personajes/SelectCoop.png');
    
        // Objetos
        this.load.image('donas', 'assets/image/personajes/donas.png');
        this.load.image('donas2', 'assets/image/personajes/donas2.png');
        this.load.image('caja', 'assets/image/personajes/caja.png');
  
  
  
  
    }

  create() {
    // 🔹 Eliminar la barra y el marco antes de pasar a la siguiente escena
    this.bar.destroy();
    this.border.destroy();


    // Pequeño retraso antes de pasar al menú (opcional)
    this.time.delayedCall(1000, () => {
      this.scene.start('MainMenu');
    });
  }
}
