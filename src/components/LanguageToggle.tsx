import { Languages } from 'lucide-react';
import { Button } from './ui/button';
import type { Language } from '../lib/language';
import { getLanguageToggleLabel } from '../lib/language';

interface LanguageToggleProps {
  language: Language;
  onToggle: () => void;
}

export default function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  const switchLabel = language === 'it' ? 'Passa all inglese' : 'Switch to Italian';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="fixed right-3 top-3 z-50 h-10 rounded-full border border-cyan-200/25 bg-slate-950/55 px-3 text-[0.72rem] font-semibold tracking-[0.2em] text-white shadow-[0_0_20px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:bg-slate-900/72 hover:text-primary sm:right-5 sm:top-5"
      aria-label={switchLabel}
      title={switchLabel}
    >
      <Languages className="mr-1.5 h-3.5 w-3.5" />
      {getLanguageToggleLabel(language)}
    </Button>
  );
}
