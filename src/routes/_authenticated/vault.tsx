import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Mail,
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
import { CopyAction, VaultAction } from "@/components/vault/copy-button";
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
        ? links.filter((l) =>
            [l.platform, l.url, l.note ?? ""].some((field) => field.toLowerCase().includes(term)),
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

      <main className="mps-rise mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts, platforms, notes"
            aria-label="Search vault"
            className="h-11 bg-card pl-9"
          />
        </div>

        <section className="mt-8" aria-labelledby="accounts-heading">
          <SectionHeader
            id="accounts-heading"
            title="Accounts"
            count={accounts.length}
            actionLabel="Add Account"
            onAction={() => setAccountDialog({ open: true, account: null, password: "" })}
          />

          <div className="mt-3 space-y-2.5">
            {isLoading ? (
              <SkeletonRows />
            ) : filteredAccounts.length === 0 ? (
              <EmptyState
                icon={<KeyRound className="h-4 w-4" aria-hidden="true" />}
                title={term ? "No matching accounts" : "No accounts yet"}
                hint={term ? "Try another search." : "Your private accounts will appear here."}
                action={
                  term ? null : (
                    <Button
                      size="sm"
                      className="mps-press"
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
                  className="mps-card mps-rise rounded-lg border border-border bg-card px-3.5 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-secondary text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{account.email}</p>
                      <p
                        className={`mt-0.5 font-mono text-xs transition-opacity duration-200 ${
                          revealed[account.id] ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {revealed[account.id] ?? "••••••••••"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <CopyAction
                      label="Copy email"
                      onCopy={() => copyText(account.email, "Email copied")}
                    >
                      Email
                    </CopyAction>
                    <VaultAction
                      label={revealed[account.id] ? "Hide password" : "Show password"}
                      onClick={() => void toggleReveal(account.id)}
                      icon={
                        revealed[account.id] ? (
                          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        )
                      }
                    >
                      {revealed[account.id] ? "Hide" : "Show"}
                    </VaultAction>
                    <CopyAction
                      label="Copy password"
                      onCopy={async () => {
                        const password = await withPassword(account.id);
                        if (!password) return false;
                        return copyText(password, "Password copied", 30_000);
                      }}
                    >
                      Password
                    </CopyAction>
                    <VaultAction
                      label="Edit account"
                      icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={async () => {
                        const password = await withPassword(account.id);
                        if (password === null) return;
                        setAccountDialog({ open: true, account, password });
                      }}
                    >
                      Edit
                    </VaultAction>
                    <VaultAction
                      label="Delete account"
                      destructive
                      icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() =>
                        setConfirm({ kind: "account", id: account.id, label: account.email })
                      }
                    >
                      Delete
                    </VaultAction>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="links-heading">
          <SectionHeader
            id="links-heading"
            title="My Links"
            count={links.length}
            actionLabel="Add Link"
            onAction={() => setLinkDialog({ open: true, link: null })}
          />

          <div className="mt-3 space-y-2.5">
            {isLoading ? (
              <SkeletonRows />
            ) : filteredLinks.length === 0 ? (
              <EmptyState
                icon={<Link2 className="h-4 w-4" aria-hidden="true" />}
                title={term ? "No matching links" : "No links yet"}
                hint={term ? "Try another search." : "Add your personal platform links."}
                action={
                  term ? null : (
                    <Button
                      size="sm"
                      className="mps-press"
                      onClick={() => setLinkDialog({ open: true, link: null })}
                    >
                      Add Link
                    </Button>
                  )
                }
              />
            ) : (
              filteredLinks.map((link) => (
                <article
                  key={link.id}
                  className="mps-card mps-rise rounded-lg border border-border bg-card px-3.5 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-secondary text-accent">
                      <PlatformIcon platform={link.platform} className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{link.platform}</p>
                      {link.note ? (
                        <p className="truncate text-xs text-muted-foreground">{link.note}</p>
                      ) : null}
                      <p className="mt-0.5 truncate text-xs text-muted-foreground/90">{link.url}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <VaultAction
                      label={`Open ${link.platform} link`}
                      icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => {
                        window.open(link.url, "_blank", "noopener,noreferrer");
                      }}
                    >
                      Open
                    </VaultAction>
                    <CopyAction label="Copy link" onCopy={() => copyText(link.url, "Link copied")}>
                      Copy
                    </CopyAction>
                    <VaultAction
                      label="Edit link"
                      icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => setLinkDialog({ open: true, link })}
                    >
                      Edit
                    </VaultAction>
                    <VaultAction
                      label="Delete link"
                      destructive
                      icon={<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                      onClick={() => setConfirm({ kind: "link", id: link.id, label: link.platform })}
                    >
                      Delete
                    </VaultAction>
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
          setAccountDialog((prev) =>
            open ? { ...prev, open } : { open: false, account: null, password: "" },
          )
        }
        account={accountDialog.account}
        initialPassword={accountDialog.password}
        saving={saving}
        onSave={(draft) => void handleSaveAccount(draft)}
      />

      <LinkDialog
        open={linkDialog.open}
        onOpenChange={(open) =>
          setLinkDialog((prev) => (open ? { ...prev, open } : { open: false, link: null }))
        }
        link={linkDialog.link}
        saving={saving}
        onSave={(draft) => void handleSaveLink(draft)}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent className="mps-appear">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "link" ? "Delete this link?" : "Delete this account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.label} will be permanently removed from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="mps-press">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmedDelete()}
              className="mps-press bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SectionHeader({
  id,
  title,
  count,
  actionLabel,
  onAction,
}: {
  id: string;
  title: string;
  count: number;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <h2 id={id} className="truncate text-sm font-medium text-foreground">
        {title}
        <span className="ml-2 text-xs text-muted-foreground">{count}</span>
      </h2>
      <Button size="sm" variant="secondary" className="mps-press shrink-0" onClick={onAction}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        {actionLabel}
      </Button>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2.5" aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className="rounded-lg border border-border bg-card px-3.5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="mps-skeleton h-8 w-8 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="mps-skeleton h-3 w-2/5" />
              <div className="mps-skeleton h-3 w-1/4" />
            </div>
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="mps-skeleton h-8 w-16" />
            <div className="mps-skeleton h-8 w-16" />
            <div className="mps-skeleton h-8 w-16" />
          </div>
        </div>
      ))}
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
    <div className="mps-rise rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground">
        {icon}
      </div>
      <p className="mt-3.5 text-sm text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
