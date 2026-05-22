import React, { createContext, useContext, useState, useCallback } from 'react';
import { Translations } from './types';
import tr from './tr';
import en from './en';

type Language = 'tr' | 'en';

const translations: Record<Language, Translations> = { tr, en };

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>(null!);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('lang') as Language | null;
    return stored && translations[stored] ? stored : 'tr';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  const t = useCallback((key: string): string => {
    const parts = key.split('.');
    let value: unknown = translations[lang];
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
