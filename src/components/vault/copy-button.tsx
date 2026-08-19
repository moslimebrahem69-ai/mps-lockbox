import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

/** Small action button with an inline copied-confirmation state. */
export function VaultAction({
  label,
  onClick,
  destructive,
  icon,
  children,
  className,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  destructive?: boolean;
  icon: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => void onClick()}
      className={cn(
        "mps-press inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        destructive
          ? "text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** Copy action whose icon briefly becomes a check. */
export function CopyAction({
  label,
  text,
  onCopy,
  children,
}: {
  label: string;
  text?: string;
  onCopy: () => Promise<boolean> | boolean;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <VaultAction
      label={label}
      icon={
        copied ? (
          <Check className="h-3.5 w-3.5 text-success transition-opacity" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5 transition-opacity" aria-hidden="true" />
        )
      }
      onClick={async () => {
        const ok = await onCopy();
        if (!ok) return;
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1400);
      }}
    >
      {copied ? "Copied" : (children ?? text)}
    </VaultAction>
  );
}
