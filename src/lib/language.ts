export type Language = 'it' | 'en';

export const LANGUAGE_STORAGE_KEY = 'halo-language';

export function getNextLanguage(language: Language): Language {
  return language === 'it' ? 'en' : 'it';
}

export function getLanguageToggleLabel(language: Language): string {
  return getNextLanguage(language).toUpperCase();
}

export function isEnglish(language: Language): boolean {
  return language === 'en';
}
