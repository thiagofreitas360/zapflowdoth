import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Funnel, FunnelStep, QuestionSettings, StepType } from '@/types/database';
import { useAuth } from './useAuth';
import { Json } from '@/integrations/supabase/types';
import { useToast } from './use-toast';

export function useFunnels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['funnels', user?.id],
    queryFn: async () => {
      const { data: funnels, error } = await supabase
        .from('funnels')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;

      // Fetch steps for each funnel
      const funnelsWithSteps = await Promise.all(
        (funnels || []).map(async (funnel) => {
          const { data: steps } = await supabase
            .from('funnel_steps')
            .select('*')
            .eq('funnel_id', funnel.id)
            .order('order_position', { ascending: true });

          const mappedSteps: FunnelStep[] = (steps || []).map(step => ({
            id: step.id,
            funnel_id: step.funnel_id,
            type: step.type as StepType,
            content: step.content,
            delay_minutes: step.delay_minutes,
            show_typing: step.show_typing,
            order_position: step.order_position,
            file_url: step.file_url,
            file_name: step.file_name,
            question_settings: step.question_settings as unknown as QuestionSettings | null,
            created_at: step.created_at,
            updated_at: step.updated_at,
          }));

          return { 
            ...funnel, 
            steps: mappedSteps
          } as Funnel;
        })
      );

      return funnelsWithSteps;
    },
    enabled: !!user,
  });
}

export function useCreateFunnel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (funnel: { name: string; description?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('funnels')
        .insert({
          name: funnel.name,
          description: funnel.description || null,
          color: funnel.color || '#6E56CF',
          user_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Funnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

export function useUpdateFunnel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; color?: string; is_favorite?: boolean; order_position?: number }) => {
      const { data, error } = await supabase
        .from('funnels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Funnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

export function useDeleteFunnel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('funnels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

export function useDuplicateFunnel() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (funnelId: string) => {
      // 1. Fetch the original funnel
      const { data: originalFunnel, error: funnelError } = await supabase
        .from('funnels')
        .select('*')
        .eq('id', funnelId)
        .single();

      if (funnelError) throw funnelError;

      // 2. Fetch the funnel steps
      const { data: originalSteps, error: stepsError } = await supabase
        .from('funnel_steps')
        .select('*')
        .eq('funnel_id', funnelId)
        .order('order_position', { ascending: true });

      if (stepsError) throw stepsError;

      // 3. Create the duplicated funnel
      const { data: newFunnel, error: createError } = await supabase
        .from('funnels')
        .insert({
          name: `${originalFunnel.name} (cópia)`,
          description: originalFunnel.description,
          color: originalFunnel.color,
          user_id: user!.id,
          order_position: originalFunnel.order_position,
          is_favorite: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 4. Duplicate all steps for the new funnel
      if (originalSteps && originalSteps.length > 0) {
        const newSteps = originalSteps.map(step => ({
          funnel_id: newFunnel.id,
          type: step.type,
          content: step.content,
          delay_minutes: step.delay_minutes,
          show_typing: step.show_typing,
          order_position: step.order_position,
          file_url: step.file_url,
          file_name: step.file_name,
          question_settings: step.question_settings,
        }));

        const { error: insertStepsError } = await supabase
          .from('funnel_steps')
          .insert(newSteps);

        if (insertStepsError) throw insertStepsError;
      }

      return newFunnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      toast({ title: "Funil duplicado!", description: "O funil foi duplicado com sucesso." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao duplicar funil." });
    },
  });
}

export function useRenameFunnel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('funnels')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Funnel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      toast({ title: "Funil renomeado!" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao renomear funil." });
    },
  });
}

export function useCreateFunnelStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (step: {
      funnel_id: string;
      type: StepType;
      content: string;
      delay_minutes?: number;
      show_typing?: boolean;
      order_position?: number;
      file_url?: string;
      file_name?: string;
      question_settings?: QuestionSettings;
    }) => {
      const { data, error } = await supabase
        .from('funnel_steps')
        .insert({
          funnel_id: step.funnel_id,
          type: step.type,
          content: step.content,
          delay_minutes: step.delay_minutes || 0,
          show_typing: step.show_typing || false,
          order_position: step.order_position || 0,
          file_url: step.file_url || null,
          file_name: step.file_name || null,
          question_settings: step.question_settings as unknown as Json || null,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        question_settings: data.question_settings as unknown as QuestionSettings | null,
      } as FunnelStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

export function useUpdateFunnelStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { 
      id: string; 
      type?: StepType;
      content?: string;
      delay_minutes?: number;
      show_typing?: boolean;
      order_position?: number;
      file_url?: string | null;
      file_name?: string | null;
      question_settings?: QuestionSettings | null;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.delay_minutes !== undefined) updateData.delay_minutes = updates.delay_minutes;
      if (updates.show_typing !== undefined) updateData.show_typing = updates.show_typing;
      if (updates.order_position !== undefined) updateData.order_position = updates.order_position;
      if (updates.file_url !== undefined) updateData.file_url = updates.file_url;
      if (updates.file_name !== undefined) updateData.file_name = updates.file_name;
      if (updates.question_settings !== undefined) updateData.question_settings = updates.question_settings as unknown as Json;

      const { data, error } = await supabase
        .from('funnel_steps')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        question_settings: data.question_settings as unknown as QuestionSettings | null,
      } as FunnelStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

export function useDeleteFunnelStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('funnel_steps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}

export function useReorderFunnelSteps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (steps: { id: string; order_position: number }[]) => {
      const updates = steps.map(step =>
        supabase
          .from('funnel_steps')
          .update({ order_position: step.order_position })
          .eq('id', step.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
    },
  });
}
