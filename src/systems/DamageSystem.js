import { GameState } from "../game/state/GameState.js";
import { events } from "../classes/GameEvents.js";
import { ServiceLocator } from "./ServiceLocator.js";

export default class DamageSystem {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
  }

   applyDamage(player, playerID) {
    const key = playerID === 1 ? "player1" : "player2";
    const state = GameState[key];

    // 🚫 Si está invulnerable, no recibe daño
    if (player.invulnerable) return;

    // 💥 Quita UNA vida (¡solo una vez!)
    state.lives--;
    events.emit("update-life", { playerID, vidas: state.lives });

    console.log("🔥 VIDAS DEL PLAYER", playerID, "=", state.lives);

    // ⭐ DISPARAR COMBO CUANDO BAJA DE 3 VIDAS
    //    (ej: de 3 → 2, solo la primera vez)
    if ((GameState.mode === "coop" || GameState.mode === "versus") && state.lives === 2) {
      console.log(`🎯 Activando combo para jugador ${playerID}`);

      if (playerID === 1 && this.scene.combo1) {
        this.scene.combo1.start();
      } else if (playerID === 2 && this.scene.combo2) {
        this.scene.combo2.start();
      }
    }

    // 🔊 Sonido de daño
    const audio = ServiceLocator.get("audio");
    if (audio) audio.play("daño", { volume: 0.6 });

    // 🔴 Efecto visual del golpe
    player.setTint(0xff0000);
    this.scene.tweens.add({
      targets: player,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        player.clearTint();
        player.alpha = 1;
      },
    });

    // 🧱 Empuje leve hacia atrás (knockback)
    const dir = Phaser.Math.Between(0, 1) ? 1 : -1;
    player.body.velocity.x = 100 * dir;
    player.body.velocity.y = -150;

    // 🕒 Invulnerabilidad temporal
    player.invulnerable = true;
    this.scene.time.delayedCall(1000, () => (player.invulnerable = false));

    // 💀 Si se quedó sin vidas, emitir evento de muerte
    if (state.lives <= 0) {
      events.emit("player-dead", { player, playerID });
    }
}


  // =====================================================
  // DAÑO A ENEMIGOS (Modo Coop)
  // =====================================================
  applyDamageToEnemy(enemy, attackerId) {
    if (!enemy || !enemy.active) return false;

    // Solo enemigos marcados como cooperativos pueden recibir daño
    if (!enemy.isCoopEnemy) return false;

    // Aplicar daño usando su propio método
    const died = enemy.takeDamage(1);

    // Sonido de golpe
    const audio = ServiceLocator.get("audio");
    if (audio) audio.play("daño", { volume: 0.5 });

    console.log(`🔥 Enemigo golpeado por Player ${attackerId}`);

    return died;
  }


}
