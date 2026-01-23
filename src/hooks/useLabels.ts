import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadLabel } from '@/types/database';
import { useAuth } from './useAuth';

export function useLabels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['labels', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_labels')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as LeadLabel[];
    },
    enabled: !!user,
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (label: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from('lead_labels')
        .insert({ ...label, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      return data as LeadLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadLabel> & { id: string }) => {
      const { data, error } = await supabase
        .from('lead_labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LeadLabel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_labels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

export function useAddLabelToLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, labelId }: { leadId: string; labelId: string }) => {
      const { data, error } = await supabase
        .from('lead_label_junction')
        .insert({ lead_id: leadId, label_id: labelId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useRemoveLabelFromLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, labelId }: { leadId: string; labelId: string }) => {
      const { error } = await supabase
        .from('lead_label_junction')
        .delete()
        .eq('lead_id', leadId)
        .eq('label_id', labelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
