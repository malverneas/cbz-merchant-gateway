-- CBZ Merchant Gateway - Storage Policies Script
-- NOTE: You must FIRST create a bucket named 'documents' in the Supabase Storage Dashboard.

-- 1. Reset policies to avoid duplicates
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual view" ON storage.objects;
DROP POLICY IF EXISTS "Allow bank staff view" ON storage.objects;
DROP POLICY IF EXISTS "Allow individual delete" ON storage.objects;

-- 2. Set up RLS policies for the 'documents' bucket

-- Allow authenticated users to upload their own files to their own folder (userId/applicationId/filename)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Allow individual view"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow bank staff to view all files for review purposes
CREATE POLICY "Allow bank staff view"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  public.is_bank_staff(auth.uid())
);

-- Allow individual delete of their own files
CREATE POLICY "Allow individual delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
