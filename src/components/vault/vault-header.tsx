import { Link } from "@tanstack/react-router";
import { LockKeyhole, Settings as SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function VaultHeader({ onLock }: { onLock: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/vault" className="min-w-0">
          <p className="text-base font-semibold tracking-[0.22em] text-foreground">MPS</p>
          <p className="truncate text-[11px] text-muted-foreground">Moslim Private Store</p>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onLock} aria-label="Lock vault">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Lock Vault</span>
          </Button>
          <Button variant="ghost" size="sm" asChild aria-label="Settings">
            <Link to="/settings">
              <SettingsIcon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
