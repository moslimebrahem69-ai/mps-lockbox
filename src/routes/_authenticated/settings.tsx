import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VaultHeader } from "@/components/vault/vault-header";
import { deleteAllVaultData, getVault } from "@/lib/vault.functions";
import { friendlyError } from "@/lib/vault-client";
import {
  AUTO_LOCK_KEY,
  readAutoLockMinutes,
  useAutoLock,
} from "@/hooks/use-auto-lock";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MPS" },
      { name: "description", content: "Security settings for the MPS private vault." },
      { property: "og:title", content: "Settings — MPS" },
      { property: "og:description", content: "Security settings for the MPS private vault." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchVault = useServerFn(getVault);
  const wipe = useServerFn(deleteAllVaultData);

  const { data } = useQuery({ queryKey: ["vault"], queryFn: () => fetchVault() });

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmNext, setConfirmNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [minutes, setMinutes] = useState(() => readAutoLockMinutes());
  const [wipeOpen, setWipeOpen] = useState(false);
  const [wipeText, setWipeText] = useState("");

  const lock = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }, [navigate, queryClient]);

  useAutoLock(
    useCallback(() => {
      void lock();
    }, [lock]),
  );

  async function changeMaster(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (next.length < 6) {
      setError("Master password must be at least 6 characters.");
      return;
    }
    if (next !== confirmNext) {
      setError("The two entries do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("Something went wrong. Please try again.");
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (reauthError) {
        setError("Incorrect password.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setCurrent("");
      setNext("");
      setConfirmNext("");
      toast.success("Master password updated");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  function saveTimeout(value: number) {
    const safe = Math.min(120, Math.max(1, Math.round(value)));
    setMinutes(safe);
    window.localStorage.setItem(AUTO_LOCK_KEY, String(safe));
    toast.success(`Auto-lock set to ${safe} min`);
  }

  async function handleWipe() {
    setWipeOpen(false);
    setWipeText("");
    try {
      await wipe({});
      await queryClient.invalidateQueries({ queryKey: ["vault"] });
      toast.success("All vault data deleted");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <VaultHeader onLock={() => void lock()} />

      <main className="mx-auto max-w-3xl space-y-8 px-4 pb-16 pt-5 mps-fade">
        <Link
          to="/vault"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to vault
        </Link>

        <section aria-labelledby="security-heading" className="space-y-4">
          <h2 id="security-heading" className="text-sm font-medium text-foreground">
            Security
          </h2>
          <form
            onSubmit={changeMaster}
            className="space-y-3 rounded-md border border-border bg-card p-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="current-master">Current master password</Label>
              <Input
                id="current-master"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-master">New master password</Label>
                <Input
                  id="new-master"
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-master">Confirm new password</Label>
                <Input
                  id="confirm-master"
                  type="password"
                  value={confirmNext}
                  onChange={(e) => setConfirmNext(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            {error ? (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? "Saving…" : "Change master password"}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => void lock()}>
                Lock vault
              </Button>
            </div>
          </form>

          <div className="rounded-md border border-border bg-card p-4">
            <Label htmlFor="session-timeout" className="text-sm">
              Session timeout
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              The vault locks automatically after this many minutes of inactivity.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Input
                id="session-timeout"
                type="number"
                min={1}
                max={120}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-24"
              />
              <Button size="sm" variant="secondary" onClick={() => saveTimeout(minutes)}>
                Save
              </Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="vault-heading" className="space-y-3">
          <h2 id="vault-heading" className="text-sm font-medium text-foreground">
            Vault
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Accounts</p>
              <p className="mt-1 text-xl text-foreground">{data?.accounts.length ?? 0}</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Saved links</p>
              <p className="mt-1 text-xl text-foreground">{data?.links.length ?? 0}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="danger-heading" className="space-y-3">
          <h2 id="danger-heading" className="text-sm font-medium text-destructive">
            Danger Zone
          </h2>
          <div className="rounded-md border border-destructive/40 bg-card p-4">
            <p className="text-sm text-foreground">Delete all vault data</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently removes every saved account and link. This cannot be undone.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={() => setWipeOpen(true)}
            >
              Delete all vault data
            </Button>
          </div>
        </section>
      </main>

      <AlertDialog
        open={wipeOpen}
        onOpenChange={(open) => {
          setWipeOpen(open);
          if (!open) setWipeText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all vault data?</AlertDialogTitle>
            <AlertDialogDescription>
              Type DELETE to confirm. Every account and link will be erased permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={wipeText}
            onChange={(e) => setWipeText(e.target.value)}
            placeholder="DELETE"
            aria-label="Type DELETE to confirm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={wipeText !== "DELETE"}
              onClick={() => void handleWipe()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
