-- Create the establishment-logos bucket if it doesn't exist (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'establishment-logos',
  'establishment-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create storage policies for the establishment-logos bucket
-- Policy 1: Anyone can view/download logos (public read)
CREATE POLICY "Public Access for Logo Downloads"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishment-logos');

-- Policy 2: Authenticated users can upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'establishment-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can update their own logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'establishment-logos' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Authenticated users can delete their own logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'establishment-logos' 
  AND auth.role() = 'authenticated'
);