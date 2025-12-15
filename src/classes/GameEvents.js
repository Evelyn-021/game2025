// src/game/classes/GameEvents.js
// Usa eventos para avisar cambios de estado (UI, vidas, donas),
// a diferencia del ServiceLocator que se usa para llamar servicios concretos.

import Phaser from "phaser";

export const events = new Phaser.Events.EventEmitter();
