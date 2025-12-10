import Phaser from "phaser";

export default class Login extends Phaser.Scene {
  constructor() {
    super("Login");
  }

  preload() {
    this.load.image("iconAnon", "assets/image/icons/persona.png");
    this.load.image("iconGitHub", "assets/image/icons/github.png");
    this.load.image("iconGoogle", "assets/image/icons/google.png");
  }

  create() {
    const mode = import.meta.env.VITE_MODE;
    console.log(`🚀 Iniciando en modo: ${mode.toUpperCase()}`);

    if (mode === "arcade") {
      this.scene.start("MainMenu");
      return;
    }

    this.firebase = this.plugins.get("FirebasePlugin");
    this.cameras.main.setBackgroundColor("#0d1117");

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // 🔳 Panel con sombra
    this.add.rectangle(cx + 5, cy + 5, 420, 460, 0x000000, 0.25);
    const panel = this.add.rectangle(cx, cy, 420, 460, 0xffffff);
    panel.setStrokeStyle(2, 0x30363d);

    // 🧾 Título
    this.add.text(cx, cy - 160, "Iniciar sesión", {
      fontFamily: "Arial",
      fontSize: 38,
      color: "#000",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // 📧 Input Email
    const emailInput = this.add.dom(cx, cy - 80, "input", {
      type: "email",
      placeholder: "Email",
      style: `
        width: 320px;
        height: 48px;
        border-radius: 8px;
        border: 1.5px solid #d0d7de;
        background-color: #ffffff;
        font-size: 17px;
        text-align: center;
        color: #24292f;
        outline: none;
        transition: all 0.2s;
      `,
    });

    // 🔒 Input Password
    const passInput = this.add.dom(cx, cy - 20, "input", {
      type: "password",
      placeholder: "Contraseña",
      style: `
        width: 320px;
        height: 48px;
        border-radius: 8px;
        border: 1.5px solid #d0d7de;
        background-color: #ffffff;
        font-size: 17px;
        text-align: center;
        color: #24292f;
        outline: none;
        transition: all 0.2s;
      `,
    });

    // ❤️ Botón principal
    const boton = this.add.rectangle(cx, cy + 40, 200, 45, 0xdb0000)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, cy + 40, "Iniciar sesión", {
      fontFamily: "Arial",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);

    // 🟣 Mensaje dinámico
    const message = this.add.text(cx, cy + 80, "", {
      fontFamily: "Arial",
      fontSize: 16,
      color: "#ff0000",
    }).setOrigin(0.5);

   
    boton.on("pointerdown", async () => {
      const email = emailInput.node.value.trim();
      const password = passInput.node.value.trim();

      if (!email || !password) {
        message.setText("⚠️ Completá ambos campos");
        return;
      }

      try {
        await this.firebase.signInWithEmail(email, password);
        message.setColor("#00b400").setText("✅ Sesión iniciada correctamente");
        setTimeout(() => this.scene.start("MainMenu"), 800);
      } catch (err) {
        console.log("⚠️ Error Firebase:", err.code);

        // Si el usuario no existe, preguntar si quiere crear
        const crearUsuario = window.confirm(
          "📭 Email no encontrado.\n¿Desea crear una cuenta nueva?"
        );

        if (crearUsuario) {
          try {
            await this.firebase.createUserWithEmail(email, password);
            message.setColor("#00b400").setText("✅ Usuario creado correctamente");
            setTimeout(() => this.scene.start("MainMenu"), 800);
          } catch (createErr) {
            console.log("🚨 Error al crear usuario:", createErr);
            message.setColor("#ff0000").setText("⚠️ No se pudo crear la cuenta");
          }
        } else {
          message.setColor("#999").setText("✉️ Creación cancelada");
        }
      }
    });

    // 🔹 Separador
    this.add.text(cx, cy + 108, "o continuar con", {
      fontFamily: "Arial",
      fontSize: 18,
      color: "#000000ff",
    }).setOrigin(0.5);

    // 🧿 Íconos (GitHub, Anónimo, Google)
    const spacing = 100;
    const yIcons = cy + 180;
    const github = this.add.image(cx - spacing, yIcons, "iconGitHub").setDisplaySize(48, 48).setInteractive({ useHandCursor: true });
    const anon = this.add.image(cx, yIcons, "iconAnon").setDisplaySize(52, 52).setInteractive({ useHandCursor: true });
    const google = this.add.image(cx + spacing, yIcons, "iconGoogle").setDisplaySize(46, 46).setInteractive({ useHandCursor: true });

    // ✨ Hover animado
    [github, anon, google].forEach(icon => {
      icon.on("pointerover", () => this.tweens.add({ targets: icon, scale: 1.15, duration: 150 }));
      icon.on("pointerout", () => this.tweens.add({ targets: icon, scale: 1, duration: 150 }));
    });

    // 🔗 Login alternativo
    github.on("pointerdown", async () => {
      try {
        await this.firebase.signInWithGithub();
        this.scene.start("MainMenu");
      } catch {
        message.setText("⚠️ Error con GitHub");
      }
    });

    anon.on("pointerdown", async () => {
      try {
        await this.firebase.signInAnonymously();
        this.scene.start("MainMenu");
      } catch {
        message.setText("⚠️ Error al ingresar como invitado");
      }
    });

    google.on("pointerdown", async () => {
      try {
        await this.firebase.signInWithGoogle();
        this.scene.start("MainMenu");
      } catch {
        message.setText("⚠️ Error con Google");
      }
    });

    // 🩶 Firma
    this.add.text(cx, this.scale.height - 80, "© Red Studio 2025", {
      fontFamily: "Arial",
      fontSize: 20,
      color: "#ff0000ff",
    }).setOrigin(0.5);
  }
}