export const GameState = {
  mode: "coop", // "coop" o "versus"

  // ❤️ Vidas compartidas en COOP
  sharedLives: 6,

  // ⭐ Meta de donas
  metaDonas: 5,

  // 📦 NUEVO: Sistema de posiciones de caja
  currentBoxPosition: 0, // Índice de la posición actual de la caja
  boxPositions: [], // Array para almacenar las posiciones de las cajas

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

    // ⭐ Resetear meta de donas
    this.metaDonas = 5;
    
    // 📦 NUEVO: Resetear posición de caja
    this.currentBoxPosition = 0;
    this.boxPositions = [];
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
    if (this.sharedLives < 6) {
      this.sharedLives++;
      console.log(`❤️ Vida recuperada! Vidas compartidas: ${this.sharedLives}`);
    }
    return this.sharedLives;
  },

  // 📦 NUEVO: Método para cambiar posición de caja
  nextBoxPosition() {
    if (this.boxPositions.length > 0) {
      this.currentBoxPosition = (this.currentBoxPosition + 1) % this.boxPositions.length;
      console.log(`📦 Nueva posición de caja: ${this.currentBoxPosition + 1}/${this.boxPositions.length}`);
    }
    return this.currentBoxPosition;
  },

  resetDonas() {
  this.player1.donasRecolectadas = 0;
  this.player2.donasRecolectadas = 0;
  console.log("🔄 Donas reseteadas a 0"); // Para debug
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