import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import type { Language } from '../lib/language';
import { getNextLanguage } from '../lib/language';

interface LanguageToggleProps {
  language: Language;
  onToggle: () => void;
}

export default function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  const nextLanguage = getNextLanguage(language);
  const label = nextLanguage === 'en' ? 'English' : 'Italiano';
  const prefix = language === 'it' ? 'Switch language' : 'Cambia lingua';
  const switchLabel = language === 'it' ? 'Passa all inglese' : 'Switch to Italian';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="welcome-language-toggle mx-auto inline-flex h-auto rounded-none border-0 bg-transparent px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/62 shadow-none transition hover:bg-transparent hover:text-white"
      aria-label={switchLabel}
      title={switchLabel}
    >
      <Languages className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
      <span>{prefix}</span>
      <span className="mx-1 text-white/38" aria-hidden="true">/</span>
      <span>{label}</span>
    </Button>
  );
}
