import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, type Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['tr'], params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bgy_post_gen_lang');
    if (saved === 'en' || saved === 'tr') return saved;
    return 'tr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bgy_post_gen_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return (key: keyof typeof translations['tr'], params?: Record<string, string | number>): string => {
      const dict = translations[language] || translations['tr'];
      let str = dict[key] || translations['tr'][key] || String(key);
      if (params) {
        Object.entries(params).forEach(([paramKey, val]) => {
          str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        });
      }
      return str;
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
