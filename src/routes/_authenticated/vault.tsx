import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PlatformIcon } from "@/components/vault/platform-icon";
import { AccountDialog, type AccountDraft } from "@/components/vault/account-dialog";
import { LinkDialog, type LinkDraft } from "@/components/vault/link-dialog";
import { copyText, friendlyError } from "@/lib/vault-client";
import type { AccountRow, LinkRow } from "@/lib/vault-schema";
import {
  deleteAccount,
  deleteLink,
  getVault,
  revealAccountPassword,
  saveAccount,
  saveLink,
} from "@/lib/vault.functions";
import { useAutoLock } from "@/hooks/use-auto-lock";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({
    meta: [
      { title: "Vault — MPS" },
      { name: "description", content: "Private accounts and links inside MPS." },
      { property: "og:title", content: "Vault — MPS" },
      { property: "og:description", content: "Private accounts and links inside MPS." },
    ],
  }),
  component: VaultPage,
});

const REVEAL_MS = 15_000;

function VaultPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchVault = useServerFn(getVault);
  const persistAccount = useServerFn(saveAccount);
  const removeAccount = useServerFn(deleteAccount);
  const reveal = useServerFn(revealAccountPassword);
  const persistLink = useServerFn(saveLink);
  const removeLink = useServerFn(deleteLink);

  const { data, isLoading } = useQuery({
    queryKey: ["vault"],
    queryFn: () => fetchVault(),
  });

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [accountDialog, setAccountDialog] = useState<{
    open: boolean;
    account: AccountRow | null;
    password: string;
  }>({ open: false, account: null, password: "" });
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; link: LinkRow | null }>({
    open: false,
    link: null,
  });
  const [confirm, setConfirm] = useState<
    { kind: "account" | "link"; id: string; label: string } | null
  >(null);

  const lock = useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    setRevealed({});
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }, [navigate, queryClient]);

  useAutoLock(
    useCallback(() => {
      void lock();
    }, [lock]),
  );

  const accounts = data?.accounts ?? [];
  const links = data?.links ?? [];

  const term = query.trim().toLowerCase();
  const filteredAccounts = useMemo(
    () => (term ? accounts.filter((a) => a.email.toLowerCase().includes(term)) : accounts),
    [accounts, term],
  );
  const filteredLinks = useMemo(
    () =>
      term
        ? links.filter(
            (l) => l.platform.toLowerCase().includes(term) || l.url.toLowerCase().includes(term),
          )
        : links,
    [links, term],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["vault"] });
  }

  async function handleSaveAccount(draft: AccountDraft) {
    setSaving(true);
    try {
      await persistAccount({ data: draft });
      setAccountDialog({ open: false, account: null, password: "" });
      await refresh();
      toast.success(draft.id ? "Account updated" : "Account saved");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveLink(draft: LinkDraft) {
    setSaving(true);
    try {
      await persistLink({ data: draft });
      setLinkDialog({ open: false, link: null });
      await refresh();
      toast.success(draft.id ? "Link updated" : "Link saved");
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmedDelete() {
    if (!confirm) return;
    const target = confirm;
    setConfirm(null);
    try {
      if (target.kind === "account") {
        await removeAccount({ data: { id: target.id } });
        setRevealed((prev) => {
          const next = { ...prev };
          delete next[target.id];
          return next;
        });
      } else {
        await removeLink({ data: { id: target.id } });
      }
      await refresh();
      toast.success("Deleted");
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  async function withPassword(id: string): Promise<string | null> {
    if (revealed[id]) return revealed[id];
    try {
      const result = await reveal({ data: { id } });
      return result.password;
    } catch (error) {
      toast.error(friendlyError(error));
      return null;
    }
  }

  async function toggleReveal(id: string) {
    if (revealed[id]) {
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    const password = await withPassword(id);
    if (!password) return;
    setRevealed((prev) => ({ ...prev, [id]: password }));
    window.setTimeout(() => {
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, REVEAL_MS);
  }

  return (
    <div className="min-h-screen bg-background">
      <VaultHeader onLock={() => void lock()} />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-5 mps-fade">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts and links"
            aria-label="Search vault"
            className="bg-card pl-9"
          />
        </div>

        <section className="mt-7" aria-labelledby="accounts-heading">
          <div className="flex items-center justify-between">
            <h2 id="accounts-heading" className="text-sm font-medium text-foreground">
              Accounts{" "}
              <span className="ml-1 text-xs text-muted-foreground">{accounts.length}</span>
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAccountDialog({ open: true, account: null, password: "" })}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Account
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : filteredAccounts.length === 0 ? (
              <EmptyState
                icon={<KeyRound className="h-4 w-4" aria-hidden="true" />}
                title={term ? "No matching accounts" : "No accounts yet"}
                hint={term ? "Try another search." : "Add your first private account."}
                action={
                  term ? null : (
                    <Button
                      size="sm"
                      onClick={() => setAccountDialog({ open: true, account: null, password: "" })}
                    >
                      Add Account
                    </Button>
                  )
                }
              />
            ) : (
              filteredAccounts.map((account) => (
                <article
                  key={account.id}
                  className="rounded-md border border-border bg-card px-3 py-3"
                >
                  <p className="truncate text-sm text-foreground">{account.email}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {revealed[account.id] ?? "••••••••••"}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    <IconAction
                      label="Copy email"
                      onClick={() => void copyText(account.email, "Email copied")}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      Email
                    </IconAction>
                    <IconAction
                      label={revealed[account.id] ? "Hide password" : "Show password"}
                      onClick={() => void toggleReveal(account.id)}
                    >
                      {revealed[account.id] ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {revealed[account.id] ? "Hide" : "Show"}
                    </IconAction>
                    <IconAction
                      label="Copy password"
                      onClick={async () => {
                        const password = await withPassword(account.id);
                        if (password) await copyText(password, "Password copied", 30_000);
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      Password
                    </IconAction>
                    <IconAction
                      label="Edit account"
                      onClick={async () => {
                        const password = await withPassword(account.id);
                        if (password === null) return;
                        setAccountDialog({ open: true, account, password });
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </IconAction>
                    <IconAction
                      label="Delete account"
                      destructive
                      onClick={() =>
                        setConfirm({ kind: "account", id: account.id, label: account.email })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </IconAction>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="links-heading">
          <div className="flex items-center justify-between">
            <h2 id="links-heading" className="text-sm font-medium text-foreground">
              My Links <span className="ml-1 text-xs text-muted-foreground">{links.length}</span>
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setLinkDialog({ open: true, link: null })}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Link
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : filteredLinks.length === 0 ? (
              <EmptyState
                icon={<Link2 className="h-4 w-4" aria-hidden="true" />}
                title={term ? "No matching links" : "No links yet"}
                hint={term ? "Try another search." : "Add your personal platform links."}
                action={
                  term ? null : (
                    <Button size="sm" onClick={() => setLinkDialog({ open: true, link: null })}>
                      Add Link
                    </Button>
                  )
                }
              />
            ) : (
              filteredLinks.map((link) => (
                <article key={link.id} className="rounded-md border border-border bg-card px-3 py-3">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={link.platform} className="h-4 w-4 text-accent" />
                    <p className="text-sm text-foreground">{link.platform}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{link.url}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    <IconAction
                      label={`Open ${link.platform} link`}
                      onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Open
                    </IconAction>
                    <IconAction
                      label="Copy link"
                      onClick={() => void copyText(link.url, "Link copied")}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      Copy
                    </IconAction>
                    <IconAction
                      label="Edit link"
                      onClick={() => setLinkDialog({ open: true, link })}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </IconAction>
                    <IconAction
                      label="Delete link"
                      destructive
                      onClick={() => setConfirm({ kind: "link", id: link.id, label: link.platform })}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </IconAction>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <AccountDialog
        open={accountDialog.open}
        onOpenChange={(open) =>
          setAccountDialog((prev) => (open ? { ...prev, open } : { open: false, account: null, password: "" }))
        }
        account={accountDialog.account}
        initialPassword={accountDialog.password}
        saving={saving}
        onSave={(draft) => void handleSaveAccount(draft)}
      />

      <LinkDialog
        open={linkDialog.open}
        onOpenChange={(open) => setLinkDialog((prev) => (open ? { ...prev, open } : { open: false, link: null }))}
        link={linkDialog.link}
        saving={saving}
        onSave={(draft) => void handleSaveLink(draft)}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "link"
                ? "Are you sure you want to delete this link?"
                : "Are you sure you want to delete this account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.label} will be permanently removed from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmedDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
        {icon}
      </div>
      <p className="mt-3 text-sm text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function IconAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => void onClick()}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
