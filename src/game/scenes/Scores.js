import FirebasePlugin from "../../plugins/FirebasePlugin.js";

export default class ScoresScene extends Phaser.Scene {
    constructor() {
        super("Scores");
    }

    async create() {
        this.add.text(400, 40, "TOP 10 JUGADORES", {
            fontFamily: "Arial",
            fontSize: 32,
            color: "#ffffff"
        }).setOrigin(0.5);

        // 📌 Fondo o panel blanco como tus otras escenas
        const panel = this.add.rectangle(400, 300, 600, 450, 0xffffff)
            .setStrokeStyle(4, 0x000000);

        this.add.text(400, 110, "Cargando puntajes...", {
            fontFamily: "Arial",
            fontSize: 24,
            color: "#000"
        }).setOrigin(0.5);

        // 🔥 Pedimos el TOP 10 desde Firebase
        const scores = await FirebasePlugin.getTopScores(10);

        // Limpio pantalla (borro el “Cargando…”)
        panel.destroy();
        this.cameras.main.setBackgroundColor("#1a1a1a");

        // Panel limpio
        this.add.rectangle(400, 300, 600, 500, 0xffffff)
            .setStrokeStyle(4, 0x000000);

        // 📜 Mostrar lista
        let y = 110;
        let pos = 1;

        for (const item of scores) {
            const txt = `${pos}. ${item.email} — ${item.puntaje} pts — ${item.personaje}`;
            this.add.text(120, y, txt, {
                fontFamily: "Arial",
                fontSize: 22,
                color: "#000"
            });

            y += 40;
            pos++;
        }

        // 🔙 Botón volver
        const volver = this.add.text(400, 550, "Volver", {
            fontFamily: "Arial",
            fontSize: 26,
            color: "#d80000"
        }).setOrigin(0.5).setInteractive();

        volver.on("pointerdown", () => {
            this.scene.start("MainMenu");
        });
    }
}
