// src/state/GameState.js
export const GameState = {
  mode: 'coop', // o 'versus'

  player1: {
    character: null,
    score: 0,
    lives: 3
  },
  player2: {
    character: null,
    score: 0,
    lives: 3
  },

  reset() {
    this.player1 = { character: null, score: 0, lives: 3 };
    this.player2 = { character: null, score: 0, lives: 3 };
    this.mode = 'coop';
  },

  // 🔹 Método útil para obtener personajes seleccionados
  getCharacters() {
    return {
      player1: this.player1.character || 'Pinky',
      player2: this.player2.character || 'Lamb'
    };
  }
};
