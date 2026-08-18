import { Facebook, GitBranch, Github, Linkedin, MessageCircle, Music2, Send } from "lucide-react";

import type { Platform } from "@/lib/vault-schema";

const ICONS: Record<Platform, typeof Github> = {
  LinkedIn: Linkedin,
  Facebook: Facebook,
  TikTok: Music2,
  Telegram: Send,
  GitHub: Github,
  Git: GitBranch,
  WhatsApp: MessageCircle,
};

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  const Icon = ICONS[platform] ?? GitBranch;
  return <Icon className={className} aria-hidden="true" />;
}
