import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Public settings (excludes sensitive fields like meta_api_key)
export interface SettingsPublic {
  id: string;
  user_id: string;
  profile_name: string | null;
  email: string | null;
  notify_new_messages: boolean;
  notify_conversions: boolean;
  notify_weekly_report: boolean;
  created_at: string;
  updated_at: string;
}

export function useSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      // Use the secure view that excludes sensitive fields
      const { data, error } = await supabase
        .from('settings_public')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data as SettingsPublic | null;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: {
      profile_name?: string;
      email?: string;
      notify_new_messages?: boolean;
      notify_conversions?: boolean;
      notify_weekly_report?: boolean;
    }) => {
      // Update goes directly to settings table (allowed by RLS UPDATE policy)
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Separate mutation for updating Meta API credentials
// This only writes to the table (no read of sensitive data)
export function useUpdateMetaApiSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (credentials: {
      meta_api_key: string;
      phone_id: string;
    }) => {
      const { error } = await supabase
        .from('settings')
        .update(credentials)
        .eq('user_id', user?.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Check if Meta API is configured (via Edge Function)
export function useCheckMetaApiStatus() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        'https://gfiwcejabijeiaidcdur.supabase.co/functions/v1/meta-api',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ action: 'check_status' }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (data.configured === false) {
          return { configured: false };
        }
        throw new Error(data.error || 'Failed to check Meta API status');
      }

      return { configured: true, data };
    },
  });
}
