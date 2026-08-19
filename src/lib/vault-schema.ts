import { z } from "zod";

export const PLATFORMS = [
  "LinkedIn",
  "Facebook",
  "Instagram",
  "TikTok",
  "Telegram",
  "GitHub",
  "Git",
  "WhatsApp",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required." })
  .max(255, { message: "Email is too long." })
  .email({ message: "Please enter a valid email address." });

export const passwordSchema = z
  .string()
  .min(1, { message: "Password is required." })
  .max(500, { message: "Password is too long." });

export const urlSchema = z
  .string()
  .trim()
  .min(1, { message: "Please enter a valid URL." })
  .max(2000, { message: "URL is too long." })
  .url({ message: "Please enter a valid URL." });

export const platformSchema = z.enum(PLATFORMS);

export const accountInputSchema = z.object({
  id: z.string().uuid().optional(),
  email: emailSchema,
  password: passwordSchema,
  label: z.string().trim().max(80).optional().nullable(),
});

export const noteSchema = z
  .string()
  .trim()
  .max(200, { message: "Note is too long." })
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const linkInputSchema = z.object({
  id: z.string().uuid().optional(),
  platform: platformSchema,
  url: urlSchema,
  note: noteSchema,
});

export type AccountRow = {
  id: string;
  email: string;
  label: string | null;
  created_at: string;
};

export type LinkRow = {
  id: string;
  platform: Platform;
  url: string;
  note: string | null;
  created_at: string;
};

export function passwordStrength(value: string): { score: number; label: string } {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  return { score, label: labels[score] ?? "Weak" };
}
