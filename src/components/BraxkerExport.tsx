import { useState } from 'react';
import { Download, Share2, Image as ImageIcon, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from './ui/button';
import { useLanguage } from './LanguageContext';

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
  const language = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const copy = language === 'en'
    ? {
        bracketNotFound: 'Unable to find the bracket to export',
        exportBracketError: 'Error while exporting the bracket',
        noTournamentToExport: 'No saved tournament to export',
        exportDataError: 'Error while exporting data',
        noTournamentToShare: 'No tournament to share',
        info: 'Info',
        players: 'Players',
        teams: 'Teams',
        type: 'Type',
        mode: 'Mode',
        format: 'Format',
        teamsTitle: 'Teams',
        copied: 'Tournament info copied to clipboard',
        copyError: 'Error while copying',
        printView: 'Print view',
        exporting: 'Exporting...',
        downloadImage: 'Download image',
        downloadJson: 'Download data (JSON)',
        copyInfo: 'Copy info',
      }
    : {
        bracketNotFound: 'Impossibile trovare il bracket da esportare',
        exportBracketError: 'Errore durante l export del bracket',
        noTournamentToExport: 'Nessun torneo salvato da esportare',
        exportDataError: 'Errore durante l export dei dati',
        noTournamentToShare: 'Nessun torneo da condividere',
        info: 'Informazioni',
        players: 'Giocatori',
        teams: 'Squadre',
        type: 'Tipo',
        mode: 'Modalita',
        format: 'Formato',
        teamsTitle: 'Squadre',
        copied: 'Informazioni torneo copiate negli appunti',
        copyError: 'Errore durante la copia',
        printView: 'Vista stampa',
        exporting: 'Esportazione...',
        downloadImage: 'Scarica come immagine',
        downloadJson: 'Scarica dati (JSON)',
        copyInfo: 'Copia info',
      };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(bracketElementId);
      if (!element) {
        alert(copy.bracketNotFound);
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
      alert(copy.exportBracketError);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = () => {
    try {
      const element = document.getElementById(bracketElementId);
      if (!element) {
        alert(copy.bracketNotFound);
        return;
      }

      const savedData = localStorage.getItem('halo_tournament_state');
      if (!savedData) {
        alert(copy.noTournamentToExport);
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
      alert(copy.exportDataError);
    }
  };

  const copyShareableText = () => {
    try {
      const savedData = localStorage.getItem('halo_tournament_state');
      if (!savedData) {
        alert(copy.noTournamentToShare);
        return;
      }

      const data = JSON.parse(savedData);

      let text = `${tournamentName}\n\n`;
      text += `${copy.info}:\n`;
      text += `- ${copy.players}: ${data.players.length}\n`;
      text += `- ${copy.teams}: ${data.teams.length}\n`;
      text += `- ${copy.type}: ${data.config.type}\n`;
      text += `- ${copy.mode}: ${data.config.teamMode}\n`;
      text += `- ${copy.format}: ${data.config.matchDuration}\n\n`;

      text += `${copy.teamsTitle}:\n`;
      data.teams.forEach((team: any, index: number) => {
        text += `${index + 1}. ${team.name}: ${team.players.map((player: any) => player.name).join(', ')}\n`;
      });

      navigator.clipboard.writeText(text).then(() => {
        alert(copy.copied);
      });
    } catch (error) {
      console.error('Error copying text:', error);
      alert(copy.copyError);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {onOpenPrintView && (
        <Button onClick={onOpenPrintView} variant="default" className="flex w-full items-center gap-2 sm:w-auto">
          <Printer className="h-4 w-4" />
          {copy.printView}
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
            {copy.exporting}
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4" />
            {copy.downloadImage}
          </>
        )}
      </Button>

      <Button onClick={exportAsJSON} variant="outline" className="flex w-full items-center gap-2 sm:w-auto">
        <Download className="h-4 w-4" />
        {copy.downloadJson}
      </Button>

      <Button onClick={copyShareableText} variant="outline" className="flex w-full items-center gap-2 sm:w-auto">
        <Share2 className="h-4 w-4" />
        {copy.copyInfo}
      </Button>
    </div>
  );
}
