import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Submit button with loading and success states. */
export function SaveButton({
  saving,
  saved,
  label,
}: {
  saving: boolean;
  saved: boolean;
  label: string;
}) {
  return (
    <Button type="submit" className="mps-press min-w-[8.5rem]" disabled={saving || saved}>
      {saved ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Saved
        </>
      ) : saving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Saving
        </>
      ) : (
        label
      )}
    </Button>
  );
}
