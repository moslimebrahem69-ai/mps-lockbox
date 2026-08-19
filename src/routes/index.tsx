import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema } from "@/lib/vault-schema";
import { MpsMark } from "@/components/vault/mps-logo";

const OWNER_KEY = "mps.owner";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MPS — Moslim Private Store" },
      { name: "description", content: "MPS private vault. Locked." },
      { property: "og:title", content: "MPS — Moslim Private Store" },
      { property: "og:description", content: "MPS private vault. Locked." },
    ],
  }),
  component: LockScreen,
});

function LockScreen() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        navigate({ to: "/vault", replace: true });
        return;
      }
      const stored = window.localStorage.getItem(OWNER_KEY);
      setOwnerEmail(stored);
      setSetupMode(!stored);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const targetEmail = setupMode ? email.trim() : (ownerEmail ?? email.trim());
    const parsedEmail = emailSchema.safeParse(targetEmail);
    if (!parsedEmail.success) {
      setError("Please enter a valid email address.");
      return;
    }
    if (pin.length < 6) {
      setError("Master password must be at least 6 characters.");
      return;
    }
    if (setupMode && pin !== confirmPin) {
      setError("The two entries do not match.");
      return;
    }

    setBusy(true);
    try {
      if (setupMode) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: parsedEmail.data,
          password: pin,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) {
          setError(
            signUpError.message.toLowerCase().includes("already")
              ? "This owner already exists. Unlock instead."
              : "Something went wrong. Please try again.",
          );
          return;
        }
        if (!data.session) {
          setError("Confirm the email we sent, then unlock.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: parsedEmail.data,
          password: pin,
        });
        if (signInError) {
          setError("Incorrect password.");
          return;
        }
      }
      window.localStorage.setItem(OWNER_KEY, parsedEmail.data);
      setPin("");
      setConfirmPin("");
      navigate({ to: "/vault", replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="mps-appear w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <MpsMark className="h-14 w-14" />
          <h1 className="mt-5 text-2xl font-semibold tracking-[0.28em] text-foreground">MPS</h1>
          <p className="mt-1.5 text-[11px] tracking-wide text-muted-foreground">
            Moslim Private Store
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
            {setupMode ? "Set up your vault" : "Private Vault"}
          </p>
        </div>

        {ready ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            {setupMode ? (
              <div className="space-y-2">
                <Label htmlFor="owner-email" className="text-xs text-muted-foreground">
                  Owner email
                </Label>
                <Input
                  id="owner-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-card"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="master-pin" className="text-xs text-muted-foreground">
                {setupMode ? "Master password / PIN" : "Master password"}
              </Label>
              <Input
                id="master-pin"
                type="password"
                inputMode="text"
                autoComplete={setupMode ? "new-password" : "current-password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="bg-card tracking-[0.3em]"
                autoFocus
              />
            </div>

            {setupMode ? (
              <div className="space-y-2">
                <Label htmlFor="confirm-pin" className="text-xs text-muted-foreground">
                  Confirm master password
                </Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••••"
                  className="bg-card tracking-[0.3em]"
                />
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="mps-press h-11 w-full" disabled={busy}>
              {busy ? "Please wait…" : setupMode ? "Create vault" : "Unlock Vault"}
            </Button>

            <div className="flex items-center justify-center pt-1 text-xs text-muted-foreground">
              <button
                type="button"
                className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
                onClick={() => {
                  setError(null);
                  setSetupMode((prev) => !prev);
                }}
              >
                {setupMode ? "I already have a vault" : "Set up a new vault"}
              </button>
            </div>

            {!setupMode && ownerEmail ? (
              <p className="text-center text-[11px] text-muted-foreground">{ownerEmail}</p>
            ) : null}
            {!setupMode && !ownerEmail ? (
              <div className="space-y-2">
                <Label htmlFor="unlock-email" className="text-xs text-muted-foreground">
                  Owner email
                </Label>
                <Input
                  id="unlock-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-card"
                />
              </div>
            ) : null}
          </form>
        ) : (
          <div className="mt-10 h-32" aria-hidden="true" />
        )}
        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">
          Private • Secure • Personal
        </p>
      </div>
    </main>
  );
}
