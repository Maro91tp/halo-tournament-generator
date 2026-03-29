import { useEffect, useState } from 'react';
import { Check, Cloud } from 'lucide-react';

interface AutoSaveIndicatorProps {
  lastSaved?: Date;
}

export default function AutoSaveIndicator({ lastSaved }: AutoSaveIndicatorProps) {
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
    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
      <Check className="w-4 h-4" />
      <span className="text-sm font-medium">Torneo salvato</span>
      <Cloud className="w-4 h-4" />
    </div>
  );
}
