import { useState } from 'react';
import { Download, Share2, Image as ImageIcon, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from './ui/button';

interface BracketExportProps {
  bracketElementId: string;
  tournamentName?: string;
  onOpenPrintView?: () => void;
}

export default function BracketExport({
  bracketElementId,
  tournamentName = 'Halo Tournament',
  onOpenPrintView,
}: BracketExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(bracketElementId);
      if (!element) {
        alert('Impossibile trovare il bracket da esportare');
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${tournamentName.replace(/\s+/g, '_')}_bracket_${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting bracket:', error);
      alert("Errore durante l'export del bracket");
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = () => {
    try {
      const element = document.getElementById(bracketElementId);
      if (!element) {
        alert('Impossibile trovare il bracket da esportare');
        return;
      }

      const savedData = localStorage.getItem('halo_tournament_state');
      if (!savedData) {
        alert('Nessun torneo salvato da esportare');
        return;
      }

      const blob = new Blob([savedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${tournamentName.replace(/\s+/g, '_')}_data_${Date.now()}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert("Errore durante l'export dei dati");
    }
  };

  const copyShareableText = () => {
    try {
      const savedData = localStorage.getItem('halo_tournament_state');
      if (!savedData) {
        alert('Nessun torneo da condividere');
        return;
      }

      const data = JSON.parse(savedData);

      let text = `${tournamentName}\n\n`;
      text += 'Informazioni:\n';
      text += `- Giocatori: ${data.players.length}\n`;
      text += `- Squadre: ${data.teams.length}\n`;
      text += `- Tipo: ${data.config.type}\n`;
      text += `- Modalita: ${data.config.teamMode}\n`;
      text += `- Formato: ${data.config.matchDuration}\n\n`;

      text += 'Squadre:\n';
      data.teams.forEach((team: any, index: number) => {
        text += `${index + 1}. ${team.name}: ${team.players.map((player: any) => player.name).join(', ')}\n`;
      });

      navigator.clipboard.writeText(text).then(() => {
        alert('Informazioni torneo copiate negli appunti');
      });
    } catch (error) {
      console.error('Error copying text:', error);
      alert('Errore durante la copia');
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {onOpenPrintView && (
        <Button onClick={onOpenPrintView} variant="default" className="flex w-full items-center gap-2 sm:w-auto">
          <Printer className="h-4 w-4" />
          Vista stampa
        </Button>
      )}

      <Button
        onClick={exportAsImage}
        disabled={isExporting}
        variant="outline"
        className="flex w-full items-center gap-2 sm:w-auto"
      >
        {isExporting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Esportazione...
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" />
            Scarica come immagine
          </>
        )}
      </Button>

      <Button onClick={exportAsJSON} variant="outline" className="flex w-full items-center gap-2 sm:w-auto">
        <Download className="h-4 w-4" />
        Scarica dati (JSON)
      </Button>

      <Button onClick={copyShareableText} variant="outline" className="flex w-full items-center gap-2 sm:w-auto">
        <Share2 className="h-4 w-4" />
        Copia info
      </Button>
    </div>
  );
}
