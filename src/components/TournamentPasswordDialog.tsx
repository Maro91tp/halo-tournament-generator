import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export type TournamentPasswordDialogMode = 'create' | 'unlock';

interface TournamentPasswordDialogProps {
  open: boolean;
  mode: TournamentPasswordDialogMode;
  tournamentName?: string | null;
  language: 'it' | 'en';
  errorMessage?: string | null;
  submitting?: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export default function TournamentPasswordDialog({
  open,
  mode,
  tournamentName,
  language,
  errorMessage,
  submitting,
  onSubmit,
  onCancel,
}: TournamentPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPassword('');
      setConfirmPassword('');
      setLocalError(null);
    }
  }, [open]);

  const copy = language === 'it'
    ? {
        createTitle: 'Scegli una password per il torneo',
        createDescription:
          'La password serve a te e agli altri per inserire i risultati. Chiunque può vedere il bracket, ma solo chi la conosce può aggiornarlo.',
        unlockTitle: 'Inserisci la password del torneo',
        unlockDescription:
          'Per salvare risultati o modifiche, inserisci la password scelta dal creatore del torneo.',
        passwordLabel: 'Password',
        confirmLabel: 'Conferma password',
        passwordPlaceholder: 'Almeno 4 caratteri',
        cancel: 'Annulla',
        createAction: 'Crea password',
        unlockAction: 'Sblocca torneo',
        tooShort: 'La password deve avere almeno 4 caratteri',
        mismatch: 'Le due password non coincidono',
      }
    : {
        createTitle: 'Choose a tournament password',
        createDescription:
          'The password is needed by you and your friends to enter match results. Anyone can view the bracket, but only people with the password can update it.',
        unlockTitle: 'Enter the tournament password',
        unlockDescription:
          'To save results or changes, enter the password chosen by the tournament creator.',
        passwordLabel: 'Password',
        confirmLabel: 'Confirm password',
        passwordPlaceholder: 'At least 4 characters',
        cancel: 'Cancel',
        createAction: 'Create password',
        unlockAction: 'Unlock tournament',
        tooShort: 'Password must be at least 4 characters',
        mismatch: 'Passwords do not match',
      };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = password.trim();
    if (trimmed.length < 4) {
      setLocalError(copy.tooShort);
      return;
    }
    if (mode === 'create' && trimmed !== confirmPassword.trim()) {
      setLocalError(copy.mismatch);
      return;
    }
    setLocalError(null);
    onSubmit(trimmed);
  };

  const title = mode === 'create' ? copy.createTitle : copy.unlockTitle;
  const description = mode === 'create' ? copy.createDescription : copy.unlockDescription;
  const action = mode === 'create' ? copy.createAction : copy.unlockAction;
  const displayedError = localError ?? errorMessage ?? null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onCancel()}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] border-amber-200/28 bg-[linear-gradient(180deg,rgba(8,18,46,0.96)_0%,rgba(6,14,34,0.98)_100%)] text-white shadow-[0_0_44px_rgba(46,131,255,0.14)] sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Lock className="h-5 w-5 text-amber-200" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription className="max-w-[42ch] text-white/72">
            {description}
            {tournamentName ? (
              <span className="mt-1 block text-white/60">
                <span className="font-semibold text-white/85">{tournamentName}</span>
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tournament-password" className="text-white/80">
              {copy.passwordLabel}
            </Label>
            <Input
              id="tournament-password"
              type="password"
              autoFocus
              autoComplete="off"
              placeholder={copy.passwordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-white/20 bg-black/30 text-white placeholder:text-white/40 focus-visible:border-amber-200/70"
            />
          </div>

          {mode === 'create' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="tournament-password-confirm" className="text-white/80">
                {copy.confirmLabel}
              </Label>
              <Input
                id="tournament-password-confirm"
                type="password"
                autoComplete="off"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="border-white/20 bg-black/30 text-white placeholder:text-white/40 focus-visible:border-amber-200/70"
              />
            </div>
          )}

          {displayedError ? (
            <p className="text-sm text-red-300" role="alert">
              {displayedError}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="h-11 rounded-[14px] border-white/25 bg-transparent text-white/80 hover:bg-white/10"
            >
              {copy.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-[14px] border border-amber-200/60 bg-primary text-primary-foreground shadow-[0_0_24px_rgba(245,180,76,0.22)] hover:shadow-[0_0_34px_rgba(245,180,76,0.3)]"
            >
              {action}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
