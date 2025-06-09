import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import de from './locales/de/translation.json';
import fr from './locales/fr/translation.json';
import ca from './locales/ca/translation.json';
import es from './locales/es/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      ca: { translation: ca },
      es: { translation: es },
    },
    fallbackLng: 'en',

    detection: {
      order: [
        'navigator',
        'localStorage',
        'querystring',
        'cookie',
        'htmlTag',
        'path',
        'subdomain',
      ],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
    },

    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;
