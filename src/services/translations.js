import { DE, EN, ES, PT } from "../enums/languages";

const PROJECT_ID = "a50d956b-7786-427b-8d0d-6a5464018003";
let translations = null;
let language = ES;

// 🔹 Detectamos el modo actual
const mode = import.meta.env.VITE_MODE;

/**
 * Obtiene las traducciones desde la API Traducila
 * Si estamos en modo arcade, no hace ningún fetch externo.
 */
export async function getTranslations(lang, callback) {
  language = lang;
  translations = null;
  localStorage.setItem("translations", null);

  // 🟣 Si es modo arcade → no llamar a la API
  if (mode === "arcade") {
    console.log("🎮 Modo arcade: traducciones deshabilitadas.");
    if (callback) callback();
    return;
  }

  // Si el idioma es español, no traducimos
  if (language === ES) {
    if (callback) callback();
    return;
  }

  try {
    console.log("🌐 Cargando traducciones desde Traducila...");
    const response = await fetch(
      `https://traducila.vercel.app/api/translations/${PROJECT_ID}/${language}`
    );
    const data = await response.json();
    localStorage.setItem("translations", JSON.stringify(data));
    translations = data;
    if (callback) callback();
  } catch (err) {
    console.warn("⚠️ Error cargando traducciones:", err);
    if (callback) callback();
  }
}

/**
 * Devuelve la traducción de una clave (key)
 */
export function getPhrase(key) {
  if (!translations) {
    const locals = localStorage.getItem("translations");
    translations = locals ? JSON.parse(locals) : null;
  }

  let phrase = key;
  const keys = translations?.data?.words;

  if (keys && Array.isArray(keys)) {
    const translation = keys.find((item) => item.key === key);
    if (translation && translation.translate) {
      phrase = translation.translate;
    }
  }

  return phrase;
}

/**
 * Verifica si el idioma es uno permitido
 */
function isAllowedLanguage(language) {
  const allowedLanguages = [ES, EN, PT, DE];
  return allowedLanguages.includes(language);
}

/**
 * Detecta el idioma del jugador (por URL o navegador)
 */
export function getLanguageConfig() {
  let languageConfig;

  const path = window.location.pathname !== "/" ? window.location.pathname : null;
  const params = new URL(window.location.href).searchParams;
  const queryLang = params.get("lang");

  languageConfig = path ?? queryLang;

  if (languageConfig) {
    if (isAllowedLanguage(languageConfig)) {
      return languageConfig;
    }
  }

  const browserLanguage = window.navigator.language;
  if (isAllowedLanguage(browserLanguage)) {
    return browserLanguage;
  }

  return ES;
}
