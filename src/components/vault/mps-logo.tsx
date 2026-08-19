import { cn } from "@/lib/utils";

/** Compact MPS mark: an "M" monogram set in a vault plate with a dial. */
export function MpsMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="MPS"
      focusable="false"
    >
      <rect x="1.5" y="1.5" width="61" height="61" rx="14" className="fill-card stroke-border" strokeWidth="3" />
      <path
        d="M18 45 V21 L32 33 L46 21 V45"
        fill="none"
        className="stroke-foreground"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="45" r="3.4" className="fill-accent" />
    </svg>
  );
}

/** Primary lockup: mark + wordmark. */
export function MpsLogo({
  className,
  markClassName,
  subtitle = "Moslim Private Store",
  align = "row",
}: {
  className?: string;
  markClassName?: string;
  subtitle?: string | null;
  align?: "row" | "column";
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        align === "column" && "flex-col gap-3 text-center",
        className,
      )}
    >
      <MpsMark className={markClassName} />
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-none tracking-[0.24em] text-foreground">
          MPS
        </span>
        {subtitle ? (
          <span className="mt-1 block truncate text-[11px] leading-none text-muted-foreground">
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
