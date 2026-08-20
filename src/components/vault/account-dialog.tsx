import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
import { emailSchema, passwordStrength, type AccountRow } from "@/lib/vault-schema";

export type AccountDraft = { id?: string | undefined; email: string; password: string };

export function AccountDialog({
  open,
  onOpenChange,
  account,
  initialPassword,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AccountRow | null;
  initialPassword: string;
  saving: boolean;
  onSave: (draft: AccountDraft) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!open) return;
    setEmail(account?.email ?? "");
    setPassword(initialPassword);
    setVisible(false);
    setErrors({});
  }, [open, account, initialPassword]);

  const strength = passwordStrength(password);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsedEmail = emailSchema.safeParse(email);
    const nextErrors: { email?: string; password?: string } = {};
    if (!parsedEmail.success) nextErrors.email = "Please enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave({ id: account?.id, email: parsedEmail.data!, password });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mps-appear sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>Stored encrypted in your private vault.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input
              id="account-email"
              type="email"
              value={email}
              placeholder="Enter Gmail address"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-password">Password</Label>
            <div className="relative">
              <Input
                id="account-password"
                type={visible ? "text" : "password"}
                value={password}
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {visible ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
            {password ? (
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">{strength.label}</span>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" className="mps-press" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="mps-press" disabled={saving}>
              {saving ? "Saving…" : "Save Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
