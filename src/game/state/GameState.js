export const GameState = {
  mode: "coop", // "coop" o "versus"

  // ❤️ Vidas compartidas en COOP
  sharedLives: 6,

  // ⭐ NUEVO: meta inicial de donas
  metaDonas: 30,

  player1: {
    character: null,
    donasRecolectadas: 0,
    lives: 3, // solo usado en VERSUS
    stats: {
      damageDealt: 0,
      enemiesDefeated: 0
    }
  },

  player2: {
    character: null,
    donasRecolectadas: 0,
    lives: 3, // solo usado en VERSUS
    stats: {
      damageDealt: 0,
      enemiesDefeated: 0
    }
  },

  // Propiedades del timer
  gameStartTime: null,
  timerActive: false,

  reset() {
    this.player1 = { 
      character: null, 
      donasRecolectadas: 0, 
      lives: 3,
      stats: { damageDealt: 0, enemiesDefeated: 0 }
    };

    this.player2 = { 
      character: null, 
      donasRecolectadas: 0, 
      lives: 3,
      stats: { damageDealt: 0, enemiesDefeated: 0 }
    };

    this.sharedLives = 6;
    this.mode = "coop";
    this.gameStartTime = null;
    this.timerActive = false;

    // ⭐ NUEVO: resetear meta de donas
    this.metaDonas = 30;
  },

  getCharacters() {
    return {
      player1: this.player1.character || "Pinky",
      player2: this.player2.character || "Lamb",
    };
  },

  // ❤️ Curación (solo útil en VERSUS)
  healPlayer(playerID) {
    const player = playerID === 1 ? this.player1 : this.player2;
    if (player.lives < 3) player.lives += 1;
    return player.lives;
  },

  // COOP: reduce vida del pool compartido
  damageShared() {
    if (this.sharedLives > 0) this.sharedLives--;
    return this.sharedLives;
  },

  // COOP: curación compartida
  healShared() {
    if (this.sharedLives < 6) this.sharedLives++;
    return this.sharedLives;
  },

  // Timer
  startGameTimer() {
    this.gameStartTime = Date.now();
    this.timerActive = true;
  },

  getGameTime() {
    if (!this.gameStartTime) return 0;
    return Date.now() - this.gameStartTime;
  },

  stopGameTimer() {
    this.timerActive = false;
  },

  // Estadísticas
  registerAttack(playerId, damage, enemyType) {
    const playerKey = `player${playerId}`;
    this[playerKey].stats.damageDealt += damage;
  },

  registerEnemyDefeat(playerId, enemyType) {
    const playerKey = `player${playerId}`;
    this[playerKey].stats.enemiesDefeated++;
  },

  getPlayerStats(playerId) {
    const playerKey = `player${playerId}`;
    return this[playerKey].stats || { damageDealt: 0, enemiesDefeated: 0 };
  }
};
