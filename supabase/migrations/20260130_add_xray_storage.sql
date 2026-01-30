-- Migration: Add X-ray and document storage support
-- Created: 2026-01-30
-- Purpose: Support image attachments for treatments (X-rays, photos)

-- Create storage bucket for X-rays and photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('xrays', 'xrays', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can only access their own files
CREATE POLICY "Users can upload their own X-rays"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'xrays' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own X-rays"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'xrays' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own X-rays"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'xrays' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add attachments column to treatments table (JSON array of file paths)
ALTER TABLE treatments
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add CT scan links column to treatments (for external DICOM links)
ALTER TABLE treatments
ADD COLUMN IF NOT EXISTS ct_scan_links jsonb DEFAULT '[]'::jsonb;

-- Example ct_scan_links format:
-- [
--   {
--     "url": "https://dentist-portal.com/scans/abc123",
--     "description": "КТ верхньої щелепи",
--     "expiry_date": "2027-01-30",
--     "added_at": "2026-01-30T12:00:00Z"
--   }
-- ]

COMMENT ON COLUMN treatments.attachments IS 'Array of Supabase Storage paths to X-ray images';
COMMENT ON COLUMN treatments.ct_scan_links IS 'Array of external CT/DICOM scan links with metadata';
