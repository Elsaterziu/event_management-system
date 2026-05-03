import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      events: "Events",
      assistant: "Assistant",
      myEvents: "My Events",
      admin: "Admin Dashboard",
      login: "Login",
      register: "Register",
      logout: "Logout",
      welcome: "Welcome",
    },
  },
  sq: {
    translation: {
      home: "Ballina",
      events: "Eventet",
      assistant: "Asistenti",
      myEvents: "Eventet e Mia",
      admin: "Paneli Admin",
      login: "Kyçu",
      register: "Regjistrohu",
      logout: "Dil",
      welcome: "Mirësevini",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;