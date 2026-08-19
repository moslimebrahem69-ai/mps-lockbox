ALTER TABLE public.links ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_platform_check;
ALTER TABLE public.links ADD CONSTRAINT links_platform_check CHECK (platform = ANY (ARRAY['LinkedIn','Facebook','Instagram','TikTok','Telegram','GitHub','Git','WhatsApp']::text[]));
ALTER TABLE public.links ADD CONSTRAINT links_note_length CHECK (note IS NULL OR char_length(note) <= 200);