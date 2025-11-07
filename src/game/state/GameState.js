export const GameState = {
  mode: "coop", // o 'versus'

  player1: {
    character: null,
    donasRecolectadas: 0,
    lives: 3,
  },
  player2: {
    character: null,
    donasRecolectadas: 0,
    lives: 3,
  },

  reset() {
    this.player1 = { character: null, donasRecolectadas: 0, lives: 3 };
    this.player2 = { character: null, donasRecolectadas: 0, lives: 3 };
    this.mode = "coop";
  },

  getCharacters() {
    return {
      player1: this.player1.character || "Pinky",
      player2: this.player2.character || "Lamb",
    };
  },




  
// ❤️ NUEVO MÉTODO DE CURACIÓN
  healPlayer(playerID) {
    const player = playerID === 1 ? this.player1 : this.player2;
    if (player.lives < 3) player.lives += 1;
    return player.lives;
  },
};
