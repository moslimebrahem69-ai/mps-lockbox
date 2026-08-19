import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accountInputSchema, linkInputSchema, type AccountRow, type LinkRow } from "./vault-schema";

export const getVault = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [accounts, links] = await Promise.all([
      context.supabase
        .from("accounts")
        .select("id, email, label, created_at")
        .order("created_at", { ascending: false }),
      context.supabase
        .from("links")
        .select("id, platform, url, note, created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (accounts.error || links.error) throw new Error("Something went wrong. Please try again.");
    return {
      accounts: (accounts.data ?? []) as AccountRow[],
      links: (links.data ?? []) as LinkRow[],
    };
  });

export const saveAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => accountInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { encryptSecret } = await import("./vault-crypto.server");
    const encrypted_password = await encryptSecret(data.password);
    const payload = {
      email: data.email,
      label: data.label ?? null,
      encrypted_password,
      user_id: context.userId,
    };
    const query = data.id
      ? context.supabase.from("accounts").update(payload).eq("id", data.id)
      : context.supabase.from("accounts").insert(payload);
    const { error } = await query;
    if (error) throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

export const revealAccountPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { decryptSecret } = await import("./vault-crypto.server");
    const { data: row, error } = await context.supabase
      .from("accounts")
      .select("encrypted_password")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) throw new Error("Something went wrong. Please try again.");
    return { password: await decryptSecret(row.encrypted_password) };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("accounts").delete().eq("id", data.id);
    if (error) throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

export const saveLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => linkInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const payload = {
      platform: data.platform,
      url: data.url,
      note: data.note ?? null,
      user_id: context.userId,
    };
    const query = data.id
      ? context.supabase.from("links").update(payload).eq("id", data.id)
      : context.supabase.from("links").insert(payload);
    const { error } = await query;
    if (error) throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

export const deleteLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("links").delete().eq("id", data.id);
    if (error) throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });

export const deleteAllVaultData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const accounts = await context.supabase
      .from("accounts")
      .delete()
      .eq("user_id", context.userId);
    const links = await context.supabase.from("links").delete().eq("user_id", context.userId);
    if (accounts.error || links.error) throw new Error("Something went wrong. Please try again.");
    return { ok: true };
  });
