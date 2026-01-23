-- 1. Create a secure view that excludes sensitive fields
CREATE VIEW public.settings_public
WITH (security_invoker = on) AS
  SELECT 
    id,
    user_id,
    profile_name,
    email,
    notify_new_messages,
    notify_conversions,
    notify_weekly_report,
    created_at,
    updated_at
  FROM public.settings;
-- Excludes: meta_api_key, phone_id

-- 2. Drop existing policies on settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.settings;

-- 3. Create stricter policies - DENY direct SELECT to protect API keys
-- Only Edge Functions with service role can read the full settings
CREATE POLICY "Deny direct SELECT to protect sensitive fields"
  ON public.settings FOR SELECT
  TO authenticated
  USING (false);

-- Allow INSERT for auto-creation on signup (via trigger with SECURITY DEFINER)
CREATE POLICY "Allow settings creation"
  ON public.settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow UPDATE for users to modify their own settings
CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add DELETE policy for data management
CREATE POLICY "Users can delete their own settings"
  ON public.settings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Grant SELECT on the public view (which excludes sensitive fields)
GRANT SELECT ON public.settings_public TO authenticated;

-- 5. Block anonymous access completely
CREATE POLICY "Deny anonymous access to settings"
  ON public.settings FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);