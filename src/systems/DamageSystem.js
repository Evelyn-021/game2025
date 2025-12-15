//DamageSystem es un servicio:

//No representa una entidad del juego (no es Player ni Enemy)

//Encapsula una responsabilidad concreta: manejar el daño
//Centraliza reglas complejas:
// (coop, versus, invulnerabilidad, HUD, eventos)

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
// 🟦 COOP → vidas compartidas
// ==========================================
if (GameState.mode === "coop") {

    if (player.invulnerable) return;

    const vidaAntes = GameState.sharedLives;

    // Quitar vida compartida
    GameState.sharedLives--;

    // HUD ACTUALIZA VIDAS
    events.emit("update-life", { playerID, vidas: GameState.sharedLives });


    // FIN: si las vidas llegan a 0 → muerte total
    if (GameState.sharedLives <= 0) {
        events.emit("player-dead", { player, playerID });
        return;
    }

    // Invulnerabilidad normal
    player.invulnerable = true;
    player.setTint(0xffaaaa);

    this.scene.time.delayedCall(800, () => {
    player.clearTint();
    player.invulnerable = false;
    player.resetState();   // ← 🔥 FIX DEFINITIVO
});


    return;
}




  // ==========================================
// 🟥 VERSUS → lógica individual
// ==========================================
const key = playerID === 1 ? "player1" : "player2";
const state = GameState[key];

if (player.invulnerable) return;

// bajar una vida individual
state.lives--;

// ⭐ COMBO: aparece cuando las vidas quedan en 2 o 1
if (GameState.mode === "versus" && state.lives < 3) {

    // jugador 1
    if (playerID === 1 && this.scene.combo1 && !this.scene.combo1.active) {
        this.scene.combo1.start();
    }

    // jugador 2
    if (playerID === 2 && this.scene.combo2 && !this.scene.combo2.active) {
        this.scene.combo2.start();
    }
}

// HUD
events.emit("update-life", { playerID, vidas: state.lives });

// si llegó a 0 → muerte
if (state.lives <= 0) {
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