import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trigger } from '@/types/database';
import { useAuth } from './useAuth';

export function useTriggers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['triggers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('triggers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as unknown as Trigger[];
    },
    enabled: !!user,
  });
}

export function useCreateTrigger() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trigger: { 
      name: string; 
      description?: string; 
      action: string; 
      icon?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('triggers')
        .insert({
          name: trigger.name,
          description: trigger.description || null,
          action: trigger.action,
          icon: trigger.icon || 'Link',
          is_active: trigger.is_active ?? true,
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Trigger;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] });
    },
  });
}

export function useUpdateTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { 
      id: string; 
      name?: string;
      description?: string;
      action?: string;
      icon?: string;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('triggers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Trigger;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] });
    },
  });
}

export function useDeleteTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] });
    },
  });
}

export function useToggleTrigger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('triggers')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Trigger;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] });
    },
  });
}
