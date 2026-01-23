-- Make avatars bucket private instead of public
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Drop the old permissive policy that allows anyone to view avatars
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create policy for authenticated users to view avatars of their own leads
CREATE POLICY "Users can view avatars of their leads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.user_id = auth.uid() 
      AND leads.avatar_url LIKE '%' || storage.objects.name || '%'
    )
  );

-- Allow users to view their own uploaded avatars (by folder structure user_id/filename)
CREATE POLICY "Users can view avatars in their folder"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );