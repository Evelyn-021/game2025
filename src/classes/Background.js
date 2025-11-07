// src/classes/Background.js
export default class Background {
  constructor(scene, key = 'background') {
    this.scene = scene;
    this.key = key;
  }

  create() {
    const bg = this.scene.add.image(0, 0, this.key).setOrigin(0, 0);
    bg.setDisplaySize(this.scene.scale.width, this.scene.scale.height);
    bg.setScrollFactor(0);
    return bg;
  }
}
