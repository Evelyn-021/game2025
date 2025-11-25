export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.music = {}; // Para separar efectos de música
  }

  /**
   * Agrega un sonido al administrador, usando su key cargada en el Preloader.
   * @param {string} key - Nombre del sonido (como se cargó en el Preloader).
   * @param {boolean} isMusic - Si es true, se guarda en la sección de música.
   */
  add(key, isMusic = false) {
    if (!this.scene.sound.get(key)) {
      const sound = this.scene.sound.add(key);
      if (isMusic) {
        this.music[key] = sound;
      } else {
        this.sounds[key] = sound;
      }
    } else {
      const sound = this.scene.sound.get(key);
      if (isMusic) {
        this.music[key] = sound;
      } else {
        this.sounds[key] = sound;
      }
    }
  }

  /**
   * Reproduce un sonido si está cargado.
   * @param {string} key - Nombre del sonido a reproducir.
   * @param {object} config - Opcional: configuración (volume, loop, rate...).
   */
  play(key, config = {}) {
    const sound = this.sounds[key] || this.music[key];
    if (sound) {
      sound.play(config);
    } else {
      console.warn(`[AudioManager] ⚠️ Sonido "${key}" no encontrado.`);
    }
  }

  /**
   * Reproduce música con configuración específica para música de fondo.
   * @param {string} key - Nombre de la música.
   * @param {number} volume - Volumen entre 0 y 1 (por defecto 0.3).
   */
  playMusic(key, volume = 0.3) {
    const music = this.music[key];
    if (music) {
      music.play({ 
        volume: volume,
        loop: true 
      });
    } else {
      console.warn(`[AudioManager] ⚠️ Música "${key}" no encontrada.`);
    }
  }

  /**
   * Detiene un sonido específico.
   * @param {string} key - Nombre del sonido.
   */
  stop(key) {
    const sound = this.sounds[key] || this.music[key];
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }

  /**
   * Detiene toda la música.
   */
  stopAllMusic() {
    Object.values(this.music).forEach(music => {
      if (music.isPlaying) music.stop();
    });
  }

  /**
   * Detiene todos los efectos de sonido.
   */
  stopAllSounds() {
    Object.values(this.sounds).forEach(sound => {
      if (sound.isPlaying) sound.stop();
    });
  }

  /**
   * Detiene todos los sonidos en reproducción.
   */
  stopAll() {
    this.stopAllSounds();
    this.stopAllMusic();
  }

  /**
   * Ajusta el volumen global de todos los efectos de sonido.
   * @param {number} volume - Valor entre 0.0 y 1.0.
   */
  setSoundsVolume(volume) {
    Object.values(this.sounds).forEach(sound => sound.setVolume(volume));
  }

  /**
   * Ajusta el volumen global de toda la música.
   * @param {number} volume - Valor entre 0.0 y 1.0.
   */
  setMusicVolume(volume) {
    Object.values(this.music).forEach(music => music.setVolume(volume));
  }

  /**
   * Activa o desactiva el mute global.
   * @param {boolean} mute - true para silenciar, false para activar.
   */
  setMute(mute) {
    Object.values(this.sounds).forEach(sound => sound.setMute(mute));
    Object.values(this.music).forEach(music => music.setMute(mute));
  }
}