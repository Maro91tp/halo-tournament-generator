import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ImageIcon, X, Paintbrush } from 'lucide-react';

const BACKGROUND_STORAGE_KEY = 'halo_tournament_background';

// Preset backgrounds
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
    // Load saved background
    const saved = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (saved) {
      setCurrentBackground(saved);
      applyBackground(saved);
    }
  }, []);

  const applyBackground = (url: string) => {
    const beforeElement = document.querySelector('body::before') as HTMLElement;
    if (url) {
      document.body.style.setProperty('--bg-image-url', `url('${url}')`);
      // Update CSS custom property
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
    if (customUrl.trim()) {
      setCurrentBackground(customUrl);
      applyBackground(customUrl);
      localStorage.setItem(BACKGROUND_STORAGE_KEY, customUrl);
      setCustomUrl('');
      setOpen(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        variant="outline"
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full shadow-lg bg-card/95 backdrop-blur-sm hover:bg-card"
        title="Personalizza sfondo"
      >
        <Paintbrush className="w-5 h-5" />
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>🎨 Personalizza Sfondo</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Presets */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Sfondi Predefiniti</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      currentBackground === preset.url
                        ? 'border-primary ring-2 ring-primary/50'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {preset.url ? (
                      <>
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold text-center px-2">
                            {preset.name}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <X className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{preset.name}</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">URL Personalizzato</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Incolla l'URL di un'immagine..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomUrl();
                  }}
                />
                <Button onClick={handleCustomUrl} disabled={!customUrl.trim()}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Applica
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Consiglio: usa immagini da Unsplash, Pexels o altri siti di immagini free
              </p>
            </div>

            {/* Current preview */}
            {currentBackground && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">Anteprima Corrente</Label>
                <div className="relative h-32 rounded-lg overflow-hidden border">
                  <img
                    src={currentBackground}
                    alt="Current background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold">Con overlay scuro</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Chiudi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
