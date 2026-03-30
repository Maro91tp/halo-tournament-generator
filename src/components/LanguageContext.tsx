import { createContext, useContext } from 'react';
import type { Language } from '../lib/language';

const LanguageContext = createContext<Language>('it');

export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return <LanguageContext.Provider value={language}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Language {
  return useContext(LanguageContext);
}
