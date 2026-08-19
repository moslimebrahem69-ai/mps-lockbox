import { toast } from "sonner";

import type { Platform } from "./vault-schema";

/** Copies text without ever logging it. */
export async function copyText(
  value: string,
  message: string,
  clearAfterMs?: number,
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(message);
    if (clearAfterMs) {
      window.setTimeout(() => {
        navigator.clipboard.writeText("").catch(() => undefined);
      }, clearAfterMs);
    }
    return true;
  } catch {
    toast.error("Couldn't copy. Please try again.");
    return false;
  }
}

export const PLATFORM_HINT: Record<Platform, string> = {
  LinkedIn: "linkedin.com/in/…",
  Facebook: "facebook.com/…",
  Instagram: "instagram.com/…",
  TikTok: "tiktok.com/@…",
  Telegram: "t.me/…",
  GitHub: "github.com/…",
  Git: "git repository URL",
  WhatsApp: "wa.me/…",
};

export function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message && error.message.length < 120) {
    return error.message.replace(/^Error:\s*/, "");
  }
  return "Something went wrong. Please try again.";
}
