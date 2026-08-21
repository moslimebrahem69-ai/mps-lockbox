import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, LockKeyhole, ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema } from "@/lib/vault-schema";
import { MpsMark } from "@/components/vault/mps-logo";
import { cn } from "@/lib/utils";

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
  const [shakeKey, setShakeKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const pinRef = useRef<HTMLInputElement | null>(null);

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

  function fail(message: string) {
    setError(message);
    setShakeKey((key) => key + 1);
    requestAnimationFrame(() => pinRef.current?.focus());
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const targetEmail = setupMode ? email.trim() : (ownerEmail ?? email.trim());
    const parsedEmail = emailSchema.safeParse(targetEmail);
    if (!parsedEmail.success) {
      fail("Please enter a valid email address.");
      return;
    }
    if (pin.length < 6) {
      fail("Master password must be at least 6 characters.");
      return;
    }
    if (setupMode && pin !== confirmPin) {
      fail("The two entries do not match.");
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
          fail(
            signUpError.message.toLowerCase().includes("already")
              ? "This owner already exists. Unlock instead."
              : "Something went wrong. Please try again.",
          );
          return;
        }
        if (!data.session) {
          fail("Confirm the email we sent, then unlock.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: parsedEmail.data,
          password: pin,
        });
        if (signInError) {
          fail("Incorrect password.");
          return;
        }
      }
      window.localStorage.setItem(OWNER_KEY, parsedEmail.data);
      setPin("");
      setConfirmPin("");
      setUnlocking(true);
      window.setTimeout(() => navigate({ to: "/vault", replace: true }), 560);
    } catch {
      fail("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="relative">
            <span
              className="mps-glow absolute -inset-3 rounded-2xl bg-accent/15 blur-xl"
              aria-hidden="true"
            />
            <MpsMark className="mps-logo-in relative h-14 w-14" />
          </span>
          <h1
            className="mps-stage mt-5 text-2xl font-semibold tracking-[0.3em] text-foreground"
            style={{ animationDelay: "220ms" }}
          >
            MPS
          </h1>
          <p
            className="mps-stage mt-2 text-[11px] tracking-[0.14em] text-muted-foreground"
            style={{ animationDelay: "340ms" }}
          >
            Moslim Private Store
          </p>
          <p
            className="mps-stage mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80"
            style={{ animationDelay: "420ms" }}
          >
            <LockKeyhole className="h-3 w-3" aria-hidden="true" />
            {setupMode ? "Set up your vault" : "Vault locked"}
          </p>
        </div>

        {ready ? (
          <div
            className={cn("mps-stage mt-8", unlocking && "mps-seal")}
            style={unlocking ? undefined : { animationDelay: "500ms" }}
          >
            <form
              key={shakeKey}
              onSubmit={handleSubmit}
              className={cn(
                "space-y-4 rounded-xl border border-border bg-card/70 p-5 shadow-[0_18px_40px_-32px_oklch(0_0_0/0.95)]",
                error && shakeKey > 0 && "mps-shake",
              )}
              noValidate
            >
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
                    className="bg-background/60"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="master-pin" className="text-xs text-muted-foreground">
                  {setupMode ? "Master password / PIN" : "Master password"}
                </Label>
                <Input
                  id="master-pin"
                  ref={pinRef}
                  type="password"
                  inputMode="text"
                  autoComplete={setupMode ? "new-password" : "current-password"}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••"
                  aria-invalid={error ? true : undefined}
                  className={cn(
                    "bg-background/60 tracking-[0.3em]",
                    error && "border-destructive focus-visible:ring-destructive",
                  )}
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
                    className="bg-background/60 tracking-[0.3em]"
                  />
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="mps-stage text-xs text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="mps-press h-11 w-full" disabled={busy || unlocking}>
                {busy || unlocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {unlocking ? "Unlocking" : "Please wait"}
                  </>
                ) : setupMode ? (
                  "Create vault"
                ) : (
                  "Unlock Vault"
                )}
              </Button>

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
                    className="bg-background/60"
                  />
                </div>
              ) : null}

              {!setupMode && ownerEmail ? (
                <p className="text-center text-[11px] text-muted-foreground">{ownerEmail}</p>
              ) : null}

              <div className="flex items-center justify-center border-t border-border/70 pt-3 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
                  onClick={() => {
                    setError(null);
                    setSetupMode((prev) => !prev);
                  }}
                >
                  {setupMode ? "I already have a vault" : "Set up a new vault"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-10 h-32" aria-hidden="true" />
        )}

        <p
          className="mps-stage mt-10 flex items-center justify-center gap-1.5 text-center text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70"
          style={{ animationDelay: "640ms" }}
        >
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          Private • Secure • Personal
        </p>
      </div>
    </main>
  );
}
