import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ActiveFunnel } from '@/types/database';
import { useAuth } from './useAuth';

export function useActiveFunnels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['active-funnels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_funnels')
        .select('*')
        .eq('is_completed', false);

      if (error) throw error;
      return data as ActiveFunnel[];
    },
    enabled: !!user,
    refetchInterval: 1000, // Refetch every second for countdown
  });
}

export function useCreateActiveFunnel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activeFunnel: {
      lead_id: string;
      funnel_id: string;
      remaining_seconds: number;
    }) => {
      const { data, error } = await supabase
        .from('active_funnels')
        .insert({
          ...activeFunnel,
          user_id: user?.id,
          current_step_index: 0,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ActiveFunnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-funnels'] });
    },
  });
}

export function useUpdateActiveFunnel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ActiveFunnel> & { id: string }) => {
      const { data, error } = await supabase
        .from('active_funnels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ActiveFunnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-funnels'] });
    },
  });
}

export function useDeleteActiveFunnel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('active_funnels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-funnels'] });
    },
  });
}

export function useCompleteActiveFunnel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('active_funnels')
        .update({ is_completed: true, remaining_seconds: 0 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ActiveFunnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-funnels'] });
    },
  });
}
