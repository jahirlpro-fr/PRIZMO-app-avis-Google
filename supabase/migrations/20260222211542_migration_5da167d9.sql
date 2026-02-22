-- Recreate policies for establishment-logos bucket
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishment-logos');

CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'establishment-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'establishment-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'establishment-logos' 
  AND auth.role() = 'authenticated'
);