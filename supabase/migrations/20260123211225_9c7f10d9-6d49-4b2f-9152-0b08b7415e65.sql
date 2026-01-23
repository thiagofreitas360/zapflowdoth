-- =====================================================
-- ZAPFLOW COMPLETE DATABASE SCHEMA
-- =====================================================

-- 1. ENUMS
-- =====================================================
CREATE TYPE public.lead_status AS ENUM ('hot', 'warm', 'cold');
CREATE TYPE public.arrival_source AS ENUM ('meta_ads', 'organic', 'referral');
CREATE TYPE public.message_type AS ENUM ('text', 'audio', 'image', 'document');
CREATE TYPE public.message_direction AS ENUM ('sent', 'received');
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE public.step_type AS ENUM ('text', 'audio', 'image', 'document', 'delay', 'question');

-- =====================================================
-- 2. BASE TABLES
-- =====================================================

-- LEADS TABLE
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  status lead_status DEFAULT 'cold',
  is_saved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  arrival_date DATE DEFAULT CURRENT_DATE,
  arrival_source arrival_source DEFAULT 'organic',
  has_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LEAD LABELS TABLE
CREATE TABLE public.lead_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6E56CF',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LEAD-LABEL JUNCTION TABLE (many-to-many)
CREATE TABLE public.lead_label_junction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.lead_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, label_id)
);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  direction message_direction NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  status message_status DEFAULT 'sent',
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FUNNELS TABLE
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6E56CF',
  is_favorite BOOLEAN DEFAULT false,
  order_position INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FUNNEL STEPS TABLE
CREATE TABLE public.funnel_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  type step_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL DEFAULT '',
  delay_minutes INTEGER DEFAULT 0,
  show_typing BOOLEAN DEFAULT false,
  order_position INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  question_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRIGGERS TABLE
CREATE TABLE public.triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Link',
  action TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SETTINGS TABLE (one per user)
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_name TEXT,
  email TEXT,
  meta_api_key TEXT,
  phone_id TEXT,
  notify_new_messages BOOLEAN DEFAULT true,
  notify_conversions BOOLEAN DEFAULT true,
  notify_weekly_report BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ACTIVE FUNNELS TABLE (tracking ongoing funnel executions)
CREATE TABLE public.active_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  current_step_index INTEGER DEFAULT 0,
  remaining_seconds INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. INDEXES
-- =====================================================
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_phone ON public.leads(phone);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_messages_lead_id ON public.messages(lead_id);
CREATE INDEX idx_messages_timestamp ON public.messages(timestamp);
CREATE INDEX idx_funnels_user_id ON public.funnels(user_id);
CREATE INDEX idx_funnels_order ON public.funnels(order_position);
CREATE INDEX idx_funnel_steps_funnel_id ON public.funnel_steps(funnel_id);
CREATE INDEX idx_funnel_steps_order ON public.funnel_steps(order_position);
CREATE INDEX idx_triggers_user_id ON public.triggers(user_id);
CREATE INDEX idx_active_funnels_user_id ON public.active_funnels(user_id);
CREATE INDEX idx_active_funnels_lead_id ON public.active_funnels(lead_id);
CREATE INDEX idx_lead_label_junction_lead_id ON public.lead_label_junction(lead_id);
CREATE INDEX idx_lead_label_junction_label_id ON public.lead_label_junction(label_id);

-- =====================================================
-- 4. HELPER FUNCTIONS (SECURITY DEFINER)
-- =====================================================

-- Check if user owns a lead
CREATE OR REPLACE FUNCTION public.user_owns_lead(_lead_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.leads
    WHERE id = _lead_id AND user_id = auth.uid()
  )
$$;

-- Check if user owns a lead label
CREATE OR REPLACE FUNCTION public.user_owns_lead_label(_label_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lead_labels
    WHERE id = _label_id AND user_id = auth.uid()
  )
$$;

-- Check if user owns a funnel
CREATE OR REPLACE FUNCTION public.user_owns_funnel(_funnel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.funnels
    WHERE id = _funnel_id AND user_id = auth.uid()
  )
$$;

-- Check if user owns a funnel step (via funnel)
CREATE OR REPLACE FUNCTION public.user_owns_funnel_step(_step_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.funnel_steps fs
    JOIN public.funnels f ON fs.funnel_id = f.id
    WHERE fs.id = _step_id AND f.user_id = auth.uid()
  )
$$;

-- Check if user owns a message (via lead)
CREATE OR REPLACE FUNCTION public.user_owns_message(_message_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.leads l ON m.lead_id = l.id
    WHERE m.id = _message_id AND l.user_id = auth.uid()
  )
$$;

-- Check if user owns an active funnel
CREATE OR REPLACE FUNCTION public.user_owns_active_funnel(_active_funnel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.active_funnels
    WHERE id = _active_funnel_id AND user_id = auth.uid()
  )
$$;

-- =====================================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON public.funnels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnel_steps_updated_at
  BEFORE UPDATE ON public.funnel_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_triggers_updated_at
  BEFORE UPDATE ON public.triggers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_active_funnels_updated_at
  BEFORE UPDATE ON public.active_funnels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. AUTO-CREATE SETTINGS ON USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.settings (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_label_junction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_funnels ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- LEADS POLICIES
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (user_id = auth.uid());

-- LEAD LABELS POLICIES
CREATE POLICY "Users can view their own labels"
  ON public.lead_labels FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own labels"
  ON public.lead_labels FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own labels"
  ON public.lead_labels FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own labels"
  ON public.lead_labels FOR DELETE
  USING (user_id = auth.uid());

-- LEAD-LABEL JUNCTION POLICIES
CREATE POLICY "Users can view their lead-label associations"
  ON public.lead_label_junction FOR SELECT
  USING (public.user_owns_lead(lead_id));

CREATE POLICY "Users can create lead-label associations"
  ON public.lead_label_junction FOR INSERT
  WITH CHECK (public.user_owns_lead(lead_id) AND public.user_owns_lead_label(label_id));

CREATE POLICY "Users can delete their lead-label associations"
  ON public.lead_label_junction FOR DELETE
  USING (public.user_owns_lead(lead_id));

-- MESSAGES POLICIES
CREATE POLICY "Users can view messages for their leads"
  ON public.messages FOR SELECT
  USING (public.user_owns_lead(lead_id));

CREATE POLICY "Users can create messages for their leads"
  ON public.messages FOR INSERT
  WITH CHECK (public.user_owns_lead(lead_id));

CREATE POLICY "Users can update messages for their leads"
  ON public.messages FOR UPDATE
  USING (public.user_owns_lead(lead_id));

CREATE POLICY "Users can delete messages for their leads"
  ON public.messages FOR DELETE
  USING (public.user_owns_lead(lead_id));

-- FUNNELS POLICIES
CREATE POLICY "Users can view their own funnels"
  ON public.funnels FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own funnels"
  ON public.funnels FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own funnels"
  ON public.funnels FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own funnels"
  ON public.funnels FOR DELETE
  USING (user_id = auth.uid());

-- FUNNEL STEPS POLICIES
CREATE POLICY "Users can view steps of their funnels"
  ON public.funnel_steps FOR SELECT
  USING (public.user_owns_funnel(funnel_id));

CREATE POLICY "Users can create steps in their funnels"
  ON public.funnel_steps FOR INSERT
  WITH CHECK (public.user_owns_funnel(funnel_id));

CREATE POLICY "Users can update steps in their funnels"
  ON public.funnel_steps FOR UPDATE
  USING (public.user_owns_funnel(funnel_id));

CREATE POLICY "Users can delete steps from their funnels"
  ON public.funnel_steps FOR DELETE
  USING (public.user_owns_funnel(funnel_id));

-- TRIGGERS POLICIES
CREATE POLICY "Users can view their own triggers"
  ON public.triggers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own triggers"
  ON public.triggers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own triggers"
  ON public.triggers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own triggers"
  ON public.triggers FOR DELETE
  USING (user_id = auth.uid());

-- SETTINGS POLICIES
CREATE POLICY "Users can view their own settings"
  ON public.settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
  ON public.settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own settings"
  ON public.settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ACTIVE FUNNELS POLICIES
CREATE POLICY "Users can view their own active funnels"
  ON public.active_funnels FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create active funnels for their leads"
  ON public.active_funnels FOR INSERT
  WITH CHECK (user_id = auth.uid() AND public.user_owns_lead(lead_id) AND public.user_owns_funnel(funnel_id));

CREATE POLICY "Users can update their own active funnels"
  ON public.active_funnels FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own active funnels"
  ON public.active_funnels FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 9. STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false);

-- STORAGE POLICIES FOR AVATARS (public read, user upload)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- STORAGE POLICIES FOR ATTACHMENTS (private)
CREATE POLICY "Users can view their attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);