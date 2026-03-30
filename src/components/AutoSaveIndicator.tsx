import { useEffect, useState } from 'react';
import { Check, Cloud } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface AutoSaveIndicatorProps {
  lastSaved?: Date;
}

export default function AutoSaveIndicator({ lastSaved }: AutoSaveIndicatorProps) {
  const language = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  if (!show) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-primary-foreground shadow-lg animate-in slide-in-from-bottom-2 fade-in sm:bottom-4 sm:right-4 sm:px-4">
      <Check className="h-4 w-4" />
      <span className="text-xs font-medium sm:text-sm">{language === 'en' ? 'Tournament saved' : 'Torneo salvato'}</span>
      <Cloud className="h-4 w-4" />
    </div>
  );
}
