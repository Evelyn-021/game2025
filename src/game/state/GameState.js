export const GameState = {
  mode: "coop", // o 'versus'

  player1: {
    character: null,
    donasRecolectadas: 0,
    lives: 3,
    stats: {
      damageDealt: 0,
      enemiesDefeated: 0
    }
  },
  player2: {
    character: null,
    donasRecolectadas: 0,
    lives: 3,
    stats: {
      damageDealt: 0,
      enemiesDefeated: 0
    }
  },

  // Propiedades para el timer
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
    this.mode = "coop";
    this.gameStartTime = null;
    this.timerActive = false;
  },

  getCharacters() {
    return {
      player1: this.player1.character || "Pinky",
      player2: this.player2.character || "Lamb",
    };
  },

  // ❤️ MÉTODO DE CURACIÓN
  healPlayer(playerID) {
    const player = playerID === 1 ? this.player1 : this.player2;
    if (player.lives < 3) player.lives += 1;
    return player.lives;
  },

  // ⏰ MÉTODOS DE TIMER
  startGameTimer() {
    console.log("⏰ Iniciando timer del juego");
    this.gameStartTime = Date.now();
    this.timerActive = true;
  },

  getGameTime() {
    if (!this.gameStartTime) return 0;
    return Date.now() - this.gameStartTime;
  },

  stopGameTimer() {
    console.log("⏰ Deteniendo timer del juego");
    this.timerActive = false;
  },

  // 📊 MÉTODOS PARA ESTADÍSTICAS COOP
  registerAttack(playerId, damage, enemyType) {
    const playerKey = `player${playerId}`;
    if (!this[playerKey].stats) {
      this[playerKey].stats = {
        damageDealt: 0,
        enemiesDefeated: 0
      };
    }
    this[playerKey].stats.damageDealt += damage;
    console.log(`📊 Jugador ${playerId} hizo ${damage} de daño a ${enemyType}`);
  },

  registerEnemyDefeat(playerId, enemyType) {
    const playerKey = `player${playerId}`;
    if (!this[playerKey].stats) {
      this[playerKey].stats = {
        damageDealt: 0,
        enemiesDefeated: 0
      };
    }
    this[playerKey].stats.enemiesDefeated++;
    console.log(`🏆 Jugador ${playerId} derrotó a ${enemyType}`);
  },

  getPlayerStats(playerId) {
    const playerKey = `player${playerId}`;
    return this[playerKey].stats || { damageDealt: 0, enemiesDefeated: 0 };
  }
};