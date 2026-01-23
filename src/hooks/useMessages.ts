import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Message, MessageType, MessageDirection, MessageStatus } from '@/types/database';

export function useMessages(leadId: string | null) {
  return useQuery({
    queryKey: ['messages', leadId],
    queryFn: async () => {
      if (!leadId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!leadId,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: {
      lead_id: string;
      content: string;
      type?: MessageType;
      direction: MessageDirection;
      status?: MessageStatus;
      file_url?: string | null;
      file_name?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          lead_id: message.lead_id,
          content: message.content,
          type: message.type || 'text',
          direction: message.direction,
          status: message.status || 'sent',
          file_url: message.file_url || null,
          file_name: message.file_name || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update lead's last message
      await supabase
        .from('leads')
        .update({
          last_message: message.content,
          last_message_time: new Date().toISOString(),
        })
        .eq('id', message.lead_id);

      return data as Message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadId, ...updates }: Partial<Message> & { id: string; leadId: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, leadId } as Message & { leadId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.leadId] });
    },
  });
}
