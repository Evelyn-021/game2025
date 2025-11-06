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
};
