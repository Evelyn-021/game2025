import { GameState } from "../game/state/GameState.js";
import { events } from "../classes/GameEvents.js";
import { ServiceLocator } from "./ServiceLocator.js";

export default class DamageSystem {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audioManager = audioManager;
  }

   applyDamage(player, playerID) {

  // ==========================================
  // 🟦 COOPERATIVO → vidas compartidas
  // ==========================================
  if (GameState.mode === "coop") {
    if (player.invulnerable) return;

    // restar 1 vida del pool compartido
    GameState.sharedLives--;

    // actualizar HUD
    events.emit("update-life", { playerID, vidas: GameState.sharedLives });

    // si llegó a 0 → muerte total
    if (GameState.sharedLives <= 0) {
      events.emit("player-dead", { player, playerID });
      return;
    }

    // Invulnerabilidad temporal
    player.invulnerable = true;
    player.setTint(0xffaaaa);

    this.scene.time.delayedCall(800, () => {
      player.clearTint();
      player.invulnerable = false;
    });

    return;
  }


  // ==========================================
  // 🟥 VERSUS → lógica individual de siempre
  // ==========================================
  const key = playerID === 1 ? "player1" : "player2";
  const state = GameState[key];

  if (player.invulnerable) return;

  // bajar una vida individual
  state.lives--;

  // HUD
  events.emit("update-life", { playerID, vidas: state.lives });

  // si llegó a 0 → muerte
  if (state.lives <= 0) {
    events.emit("player-dead", { player, playerID });
    return;
  }

  // Invulnerabilidad
  player.invulnerable = true;
  player.setTint(0xffaaaa);

  this.scene.time.delayedCall(800, () => {
    player.clearTint();
    player.invulnerable = false;
  });
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
