import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadLabel, LeadStatus, ArrivalSource } from '@/types/database';
import { useAuth } from './useAuth';

export function useLeads() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('last_message_time', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Fetch labels for each lead
      const leadsWithLabels = await Promise.all(
        (leads || []).map(async (lead) => {
          const { data: junctions } = await supabase
            .from('lead_label_junction')
            .select('label_id')
            .eq('lead_id', lead.id);

          if (junctions && junctions.length > 0) {
            const labelIds = junctions.map((j) => j.label_id);
            const { data: labels } = await supabase
              .from('lead_labels')
              .select('*')
              .in('id', labelIds);
            return { ...lead, labels: labels as LeadLabel[] || [] } as Lead;
          }
          return { ...lead, labels: [] } as Lead;
        })
      );

      return leadsWithLabels;
    },
    enabled: !!user,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lead: { 
      phone: string; 
      name?: string; 
      status?: LeadStatus; 
      arrival_source?: ArrivalSource 
    }) => {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          phone: lead.phone,
          name: lead.name || null,
          status: lead.status || 'cold',
          arrival_source: lead.arrival_source || 'organic',
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { 
      id: string;
      name?: string;
      phone?: string;
      status?: LeadStatus;
      is_saved?: boolean;
      is_pinned?: boolean;
      has_purchased?: boolean;
      avatar_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useToggleLeadPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({ is_pinned })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
