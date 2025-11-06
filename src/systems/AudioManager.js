export default class AudioManager {
  constructor(scene) {
    // Guarda la escena que lo usa (para acceder a Phaser.Sound)
    this.scene = scene;
    this.sounds = {};
  }

  /**
   * Agrega un sonido al administrador, usando su key cargada en el Preloader.
   * @param {string} key - Nombre del sonido (como se cargó en el Preloader).
   */
  add(key) {
    if (!this.scene.sound.get(key)) {
      this.sounds[key] = this.scene.sound.add(key);
    } else {
      this.sounds[key] = this.scene.sound.get(key);
    }
  }

  /**
   * Reproduce un sonido si está cargado.
   * @param {string} key - Nombre del sonido a reproducir.
   * @param {object} config - Opcional: configuración (volume, loop, rate...).
   */
  play(key, config = {}) {
    const sound = this.sounds[key];
    if (sound) {
      sound.play(config);
    } else {
      console.warn(`[AudioManager] ⚠️ Sonido "${key}" no encontrado.`);
    }
  }

  /**
   * Detiene un sonido específico.
   * @param {string} key - Nombre del sonido.
   */
  stop(key) {
    const sound = this.sounds[key];
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }

  /**
   * Detiene todos los sonidos en reproducción.
   */
  stopAll() {
    Object.values(this.sounds).forEach(sound => {
      if (sound.isPlaying) sound.stop();
    });
  }

  /**
   * Ajusta el volumen global de todos los sonidos.
   * @param {number} volume - Valor entre 0.0 y 1.0.
   */
  setVolume(volume) {
    Object.values(this.sounds).forEach(sound => sound.setVolume(volume));
  }

  /**
   * Activa o desactiva el mute global.
   * @param {boolean} mute - true para silenciar, false para activar.
   */
  setMute(mute) {
    Object.values(this.sounds).forEach(sound => sound.setMute(mute));
  }
}
