import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "../locales/en.json";
import thTranslations from "../locales/th.json";
import zhTranslations from "../locales/zh.json";

const resources = {
  en: { translation: enTranslations },
  th: { translation: thTranslations },
  zh: { translation: zhTranslations },
};

// Get saved language from localStorage or use browser language
const getSavedLanguage = () => {
  const saved = localStorage.getItem("language");
  if (saved && ["en", "th", "zh"].includes(saved)) {
    return saved;
  }
  
  // Try to detect browser language
  const browserLang = navigator.language.split("-")[0];
  if (["en", "th", "zh"].includes(browserLang)) {
    return browserLang;
  }
  
  return "en"; // Default to English
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSavedLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
