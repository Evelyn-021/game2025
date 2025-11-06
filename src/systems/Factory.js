export default class Factory {
  static createMap(scene) {
    const map = scene.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("suelo", "tiles");
    const layer = map.createLayer("plataformas", tileset, 0, 0);
    layer.setCollisionByProperty({ esColisionable: true });
    return { map, layer };
  }
}
