import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlatformIcon } from "@/components/vault/platform-icon";
import { PLATFORMS, urlSchema, type LinkRow, type Platform } from "@/lib/vault-schema";

export type LinkDraft = {
  id?: string | undefined;
  platform: Platform;
  url: string;
  note: string | null;
};

export function LinkDialog({
  open,
  onOpenChange,
  link,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkRow | null;
  saving: boolean;
  onSave: (draft: LinkDraft) => void;
}) {
  const [platform, setPlatform] = useState<Platform>("LinkedIn");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPlatform(link?.platform ?? "LinkedIn");
    setUrl(link?.url ?? "");
    setNote(link?.note ?? "");
    setError(null);
  }, [open, link]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      setError("Please enter a valid URL.");
      return;
    }
    onSave({ id: link?.id, platform, url: parsed.data, note: note.trim() ? note.trim() : null });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mps-appear sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{link ? "Edit link" : "Add link"}</DialogTitle>
          <DialogDescription>Only your own platform links.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="link-platform">Platform</Label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
              <SelectTrigger id="link-platform" aria-label="Platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((item) => (
                  <SelectItem key={item} value={item}>
                    <span className="flex items-center gap-2">
                      <PlatformIcon platform={item} className="h-3.5 w-3.5 text-muted-foreground" />
                      {item}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              placeholder="Paste your link here"
              onChange={(e) => setUrl(e.target.value)}
              inputMode="url"
              autoComplete="off"
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-note">
              Note <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="link-note"
              value={note}
              maxLength={200}
              placeholder="Add a note (optional)"
              onChange={(e) => setNote(e.target.value)}
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" className="mps-press" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="mps-press" disabled={saving}>
              {saving ? "Saving…" : "Save Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
