export default class ObjectPool {
  constructor(scene, key, maxSize = 10) {
    this.scene = scene;
    this.key = key;
    this.pool = [];

    for (let i = 0; i < maxSize; i++) {
      const obj = scene.add.sprite(0, 0, key).setVisible(false).setActive(false);
      this.pool.push(obj);
    }
  }

  spawn(x, y) {
    const obj = this.pool.find((o) => !o.active);
    if (!obj) return null;

    obj.setPosition(x, y).setActive(true).setVisible(true);
    return obj;
  }

  release(obj) {
    obj.setActive(false).setVisible(false);
  }

  releaseAll() {
    this.pool.forEach((o) => this.release(o));
  }
}
