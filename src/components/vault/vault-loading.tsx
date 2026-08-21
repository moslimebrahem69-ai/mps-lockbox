import { MpsMark } from "@/components/vault/mps-logo";

/** Quiet full-screen loading state built from the MPS mark. */
export function VaultLoading({ label = "Opening vault" }: { label?: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background"
      role="status"
      aria-live="polite"
    >
      <MpsMark className="mps-breathe h-12 w-12" />
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
    </div>
  );
}
