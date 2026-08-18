// Server-only. AES-GCM encryption for stored credentials.
// The key never leaves the server runtime and is never logged.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function getKey(): Promise<CryptoKey> {
  const secret = process.env["VAULT_ENCRYPTION_KEY"];
  if (!secret) throw new Error("Vault encryption key is not configured");
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptSecret(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plain)),
  );
  return `v1.${toBase64(iv)}.${toBase64(cipher)}`;
}

export async function decryptSecret(payload: string): Promise<string> {
  const parts = payload.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("Corrupted record");
  const key = await getKey();
  const iv = fromBase64(parts[1] ?? "");
  const cipher = fromBase64(parts[2] ?? "");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return decoder.decode(plain);
}
