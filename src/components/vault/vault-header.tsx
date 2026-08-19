import { Link } from "@tanstack/react-router";
import { LockKeyhole, Settings as SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MpsLogo } from "@/components/vault/mps-logo";

export function VaultHeader({ onLock }: { onLock: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/vault" aria-label="MPS vault" className="min-w-0">
          <MpsLogo markClassName="h-8 w-8" />
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Settings"
            className="mps-press min-h-11 min-w-11 sm:min-h-9 sm:min-w-9"
          >
            <Link to="/settings">
              <SettingsIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onLock}
            aria-label="Lock vault"
            className="mps-press min-h-11 sm:min-h-9"
          >
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Lock</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
