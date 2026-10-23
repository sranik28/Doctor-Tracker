import { Stethoscope } from 'lucide-react';
import { cn } from 'cn';

interface AppLogoProps {
  className?: string;
  /** Use on dark/primary backgrounds. */
  inverted?: boolean;
}

export function AppLogo({ className, inverted = false }: AppLogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5 font-semibold tracking-tight', className)}>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          inverted ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
        )}
        aria-hidden="true"
      >
        <Stethoscope className="size-4" />
      </span>
      <span>Doctor Tracker</span>
    </span>
  );
}
