-- Drop existing policies on leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Create stricter policies that explicitly require authentication
CREATE POLICY "Authenticated users can view their own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create their own leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update their own leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete their own leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Explicitly deny access to anon role
CREATE POLICY "Deny anonymous access to leads"
  ON public.leads FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);