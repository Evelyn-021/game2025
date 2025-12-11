import { Scene } from "phaser";
import { getTranslations, getPhrase } from "../../services/translations";
import { ES, EN, PT } from "../../enums/languages";

export default class Scores extends Scene {
    constructor() {
        super("Scores");
        this.scores = [];
        this.isLoading = true;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBackgroundColor("#1a1a2e");

        // ================================
        // FONDO SIMPLE
        // ================================
        this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a1a);

        // ================================
        // TÍTULO CON SOMBRA
        // ================================
        this.add.text(W / 2, 40, getPhrase("TOP 5 JUGADORES"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "28px",
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 8,
            shadow: { 
                offsetX: 4, 
                offsetY: 4, 
                color: "#ff0000", 
                blur: 0, 
                fill: true 
            }
        }).setOrigin(0.5);

        // ================================
        // SUBTÍTULO
        // ================================
        this.add.text(W / 2, 80, getPhrase("MEJORES PUNTAJES"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "14px",
            color: "#00ffff",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);

        // ================================
        // PANEL PRINCIPAL
        // ================================
        const panelWidth = Math.min(700, W - 40);
        const panelHeight = 320;
        
        this.panel = this.add.rectangle(W / 2, H / 2, panelWidth, panelHeight, 0x000000, 0.8)
            .setStrokeStyle(4, 0xffff00);

        // ================================
        // ENCABEZADOS DE COLUMNAS
        // ================================
        const headerY = 140;
        
        // POSICIÓN
        this.add.text(W / 2 - 180, headerY, getPhrase("POS"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "16px",
            color: "#ffff00",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // JUGADOR (más ancho)
        this.add.text(W / 2, headerY, getPhrase("JUGADOR"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "16px",
            color: "#ffff00",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // PUNTOS
        this.add.text(W / 2 + 180, headerY, getPhrase("PUNTOS"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "16px",
            color: "#ffff00",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // ================================
        // TEXTO DE CARGA
        // ================================
        this.loadingText = this.add.text(W / 2, H / 2, getPhrase("Cargando puntajes..."), {
            fontFamily: '"Press Start 2P"',
            fontSize: "18px",
            color: "#ffffff",
            stroke: "#000",
            strokeThickness: 4
        }).setOrigin(0.5);

        // ================================
        // CARGAR SCORES
        // ================================
        this.loadScores();

        // ================================
        // BOTÓN VOLVER
        // ================================
        this.createBackButton();
    }

    async loadScores() {
        try {
            const firebasePlugin = this.plugins.get('FirebasePlugin');
            
            if (!firebasePlugin) {
                this.showError(getPhrase("Plugin no encontrado"));
                return;
            }
            
            if (!firebasePlugin.ready) {
                this.showError(getPhrase("Firebase no disponible"));
                return;
            }

            console.log("📡 Obteniendo TOP 5 scores únicos...");
            const scores = await firebasePlugin.getTopScores(5);
            
            console.log("✅ Scores únicos obtenidos:", scores);
            
            if (!scores || scores.length === 0) {
                this.showNoScores();
                return;
            }
            
            this.scores = scores;
            this.isLoading = false;
            this.displayScores();
            
        } catch (err) {
            console.error("❌ Error cargando scores:", err);
            this.showError(getPhrase("Error al cargar"));
        }
    }

    displayScores() {
        // Limpiar texto de carga
        if (this.loadingText) {
            this.loadingText.destroy();
        }

        const W = this.scale.width;
        let startY = 180;
        const spacing = 48; // Más espacio

        // Mostrar cada score
        this.scores.forEach((s, i) => {
            const rank = `${i + 1}.`;
            // 🔥 Usar email si está disponible
            const nombre = s.email || s.nombre || "Anónimo";
            const puntaje = s.puntaje || 0;

            // Emojis para podio
            let emoji = "";
            if (i === 0) emoji = "🥇 ";
            else if (i === 1) emoji = "🥈 ";
            else if (i === 2) emoji = "🥉 ";

            // ================================
            // COLUMNA 1: POSICIÓN + EMOJI
            // ================================
            this.add.text(W / 2 - 180, startY, `${emoji}${rank}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: i < 3 ? "22px" : "18px",
                color: i < 3 ? "#ffdd00" : "#ffffff",
                stroke: "#000",
                strokeThickness: 4
            }).setOrigin(0.5);

            // ================================
            // COLUMNA 2: EMAIL/JUGADOR (AJUSTADO)
            // ================================
            // 🔥 TRUNCAR email si es muy largo, pero mejor que antes
            let displayName = nombre;
            if (nombre.includes('@')) {
                // Para emails: mostrar usuario@dominio (truncado si necesario)
                const maxLength = 20;
                if (nombre.length > maxLength) {
                    const atIndex = nombre.indexOf('@');
                    const username = nombre.substring(0, Math.min(atIndex, 12));
                    const domain = nombre.substring(atIndex);
                    displayName = username + (username.length < atIndex ? '...' : '') + domain;
                }
            } else {
                // Para nombres normales
                const maxLength = 18;
                if (nombre.length > maxLength) {
                    displayName = nombre.substring(0, maxLength - 3) + '...';
                }
            }

            this.add.text(W / 2, startY, displayName, {
                fontFamily: '"Press Start 2P"',
                fontSize: i < 3 ? "16px" : "14px",
                color: i < 3 ? "#ffaa00" : "#ffffff",
                stroke: "#000",
                strokeThickness: 3
            }).setOrigin(0.5);

            // ================================
            // COLUMNA 3: PUNTOS
            // ================================
            this.add.text(W / 2 + 180, startY, puntaje.toString(), {
                fontFamily: '"Press Start 2P"',
                fontSize: i < 3 ? "22px" : "18px",
                color: i < 3 ? "#00ffff" : "#66ffff",
                stroke: "#000",
                strokeThickness: 4
            }).setOrigin(0.5);

            // ================================
            // LÍNEA DIVISORIA (opcional)
            // ================================
            if (i < this.scores.length - 1) {
                this.add.line(
                    W / 2, 
                    startY + spacing / 2 - 2, 
                    0, 0, 
                    280, 0, 
                    0x444444
                ).setOrigin(0.5);
            }

            startY += spacing;
        });

        // ================================
        // FOOTER INFORMATIVO
        // ================================
        const H = this.scale.height;
        this.add.text(W / 2, H - 120, getPhrase("Solo se muestra el mejor score por jugador"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "10px",
            color: "#888888",
            stroke: "#000",
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    showError(message) {
        this.isLoading = false;
        
        if (this.loadingText) {
            this.loadingText.setText(message);
            this.loadingText.setColor("#ff6666");
        }
        
        this.add.text(this.scale.width / 2, 200, "😢", {
            fontFamily: '"Press Start 2P"',
            fontSize: "40px"
        }).setOrigin(0.5);
    }

    showNoScores() {
        this.isLoading = false;
        
        if (this.loadingText) {
            this.loadingText.setText(getPhrase("No hay puntajes aún"));
            this.loadingText.setColor("#ffaa00");
        }
        
        const W = this.scale.width;
        const H = this.scale.height;
        
        this.add.text(W / 2, 220, getPhrase("¡Sé el primero!"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "22px",
            color: "#ffff00",
            stroke: "#000",
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(W / 2, 260, getPhrase("Juega y guarda tu puntaje"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "14px",
            color: "#ffffff",
            stroke: "#000",
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(W / 2, 300, "🎮", {
            fontFamily: '"Press Start 2P"',
            fontSize: "50px"
        }).setOrigin(0.5);
    }

    createBackButton() {
        const W = this.scale.width;
        const H = this.scale.height;
        
        const volver = this.add.text(W / 2, H - 60, getPhrase("VOLVER"), {
            fontFamily: '"Press Start 2P"',
            fontSize: "22px",
            color: "#ff9933",
            stroke: "#000",
            strokeThickness: 6,
            backgroundColor: "#222222",
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive();
        
        // Animación hover
        volver.on("pointerover", () => {
            volver.setScale(1.1);
            volver.setColor("#ffcc00");
            volver.setBackgroundColor("#333333");
        });
        
        volver.on("pointerout", () => {
            volver.setScale(1);
            volver.setColor("#ff9933");
            volver.setBackgroundColor("#222222");
        });
        
        volver.on("pointerdown", () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start("MainMenu");
            });
        });
    }

    update() {
        // Animación de carga
        if (this.isLoading && this.loadingText) {
            const time = this.time.now % 1200;
            let frame = Math.floor(time / 300);
            
            const dots = ".".repeat(frame + 1);
            const baseText = getPhrase("Cargando puntajes").replace("...", "").replace("..", "").replace(".", "");
            this.loadingText.setText(baseText + dots);
        }
    }
}