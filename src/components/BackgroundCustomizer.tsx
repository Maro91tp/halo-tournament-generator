import { useEffect, useState } from 'react';
import { ImageIcon, Paintbrush, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

const BACKGROUND_STORAGE_KEY = 'halo_tournament_background';

const PRESETS = [
  {
    name: 'Halo Arena',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2065&auto=format&fit=crop',
  },
  {
    name: 'Sci-Fi Station',
    url: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Space Battle',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  },
  {
    name: 'Dark Tech',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Nessuno sfondo',
    url: '',
  },
];

export default function BackgroundCustomizer() {
  const [open, setOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [currentBackground, setCurrentBackground] = useState(PRESETS[0].url);

  useEffect(() => {
    const saved = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (saved) {
      setCurrentBackground(saved);
      applyBackground(saved);
    }
  }, []);

  const applyBackground = (url: string) => {
    if (url) {
      document.documentElement.style.setProperty('--background-image', `url('${url}')`);
    } else {
      document.documentElement.style.setProperty('--background-image', 'none');
    }
  };

  const handleSelectPreset = (url: string) => {
    setCurrentBackground(url);
    applyBackground(url);
    localStorage.setItem(BACKGROUND_STORAGE_KEY, url);
    setOpen(false);
  };

  const handleCustomUrl = () => {
    if (!customUrl.trim()) return;

    setCurrentBackground(customUrl);
    applyBackground(customUrl);
    localStorage.setItem(BACKGROUND_STORAGE_KEY, customUrl);
    setCustomUrl('');
    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        variant="outline"
        className="fixed bottom-3 left-3 z-50 h-11 w-11 rounded-full bg-card/95 shadow-lg backdrop-blur-sm hover:bg-card sm:bottom-4 sm:left-4 sm:h-12 sm:w-12"
        title="Personalizza sfondo"
      >
        <Paintbrush className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Personalizza sfondo</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="mb-3 block text-sm font-semibold">Sfondi predefiniti</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative h-24 overflow-hidden rounded-lg border-2 transition-all ${
                      currentBackground === preset.url
                        ? 'border-primary ring-2 ring-primary/50'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {preset.url ? (
                      <>
                        <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="px-2 text-center text-xs font-semibold text-white">{preset.name}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <div className="text-center">
                          <X className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{preset.name}</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block text-sm font-semibold">URL personalizzato</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Incolla l'URL di un'immagine..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomUrl();
                  }}
                />
                <Button onClick={handleCustomUrl} disabled={!customUrl.trim()} className="w-full sm:w-auto">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Applica
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Consiglio: usa immagini da Unsplash, Pexels o altri siti di immagini free.
              </p>
            </div>

            {currentBackground && (
              <div>
                <Label className="mb-3 block text-sm font-semibold">Anteprima corrente</Label>
                <div className="relative h-32 overflow-hidden rounded-lg border">
                  <img
                    src={currentBackground}
                    alt="Current background"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/60 via-black/40 to-black/60">
                    <span className="text-center text-sm font-semibold text-white sm:text-base">
                      Anteprima con overlay scuro
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
