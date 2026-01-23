import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BackupData {
  version: string;
  exportedAt: string;
  backupName: string;
  funnels: any[];
  funnelSteps: any[];
  labels: any[];
  triggers: any[];
}

interface BackupStats {
  funnels: number;
  funnelSteps: number;
  labels: number;
  triggers: number;
}

export function useBackup() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [stats, setStats] = useState<BackupStats>({
    funnels: 0,
    funnelSteps: 0,
    labels: 0,
    triggers: 0,
  });

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [funnelsRes, stepsRes, labelsRes, triggersRes] = await Promise.all([
      supabase.from('funnels').select('id', { count: 'exact', head: true }),
      supabase.from('funnel_steps').select('id', { count: 'exact', head: true }),
      supabase.from('lead_labels').select('id', { count: 'exact', head: true }),
      supabase.from('triggers').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      funnels: funnelsRes.count || 0,
      funnelSteps: stepsRes.count || 0,
      labels: labelsRes.count || 0,
      triggers: triggersRes.count || 0,
    });
  };

  const generateBackup = async (backupName: string) => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Fetch all data
      const [funnelsRes, labelsRes, triggersRes] = await Promise.all([
        supabase.from('funnels').select('*'),
        supabase.from('lead_labels').select('*'),
        supabase.from('triggers').select('*'),
      ]);

      if (funnelsRes.error) throw funnelsRes.error;
      if (labelsRes.error) throw labelsRes.error;
      if (triggersRes.error) throw triggersRes.error;

      // Fetch funnel steps for all funnels
      const funnelIds = (funnelsRes.data || []).map(f => f.id);
      let stepsData: any[] = [];
      
      if (funnelIds.length > 0) {
        const stepsRes = await supabase
          .from('funnel_steps')
          .select('*')
          .in('funnel_id', funnelIds);
        
        if (stepsRes.error) throw stepsRes.error;
        stepsData = stepsRes.data || [];
      }

      const backup: BackupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        backupName,
        funnels: funnelsRes.data || [],
        funnelSteps: stepsData,
        labels: labelsRes.data || [],
        triggers: triggersRes.data || [],
      };

      setBackupData(backup);
      toast.success('Backup gerado com sucesso! Clique em "Fazer download" para baixar.');
      return backup;
    } catch (error: any) {
      toast.error('Erro ao gerar backup: ' + error.message);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBackup = () => {
    if (!backupData) return;

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${backupData.backupName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Backup baixado com sucesso!');
  };

  const importBackup = async (file: File, replaceAll: boolean) => {
    setIsImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const content = await file.text();
      const data: BackupData = JSON.parse(content);

      // Validate backup format
      if (!data.version || !data.funnels || !data.labels || !data.triggers) {
        throw new Error('Formato de backup inválido');
      }

      if (replaceAll) {
        // Delete all existing data
        await Promise.all([
          supabase.from('funnel_steps').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          supabase.from('triggers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        ]);
        await supabase.from('funnels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('lead_labels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      // Create ID mapping for funnels (old ID -> new ID)
      const funnelIdMap = new Map<string, string>();

      // Import labels
      if (data.labels.length > 0) {
        const labelsToInsert = data.labels.map(label => ({
          ...label,
          id: undefined, // Let DB generate new ID
          user_id: user.id,
        }));
        const { error } = await supabase.from('lead_labels').insert(labelsToInsert);
        if (error) throw error;
      }

      // Import funnels with new IDs
      if (data.funnels.length > 0) {
        for (const funnel of data.funnels) {
          const oldId = funnel.id;
          const { data: newFunnel, error } = await supabase
            .from('funnels')
            .insert({
              ...funnel,
              id: undefined, // Let DB generate new ID
              user_id: user.id,
            })
            .select()
            .single();
          
          if (error) throw error;
          if (newFunnel) {
            funnelIdMap.set(oldId, newFunnel.id);
          }
        }
      }

      // Import funnel steps with updated funnel_id references
      if (data.funnelSteps && data.funnelSteps.length > 0) {
        const stepsToInsert = data.funnelSteps
          .filter(step => funnelIdMap.has(step.funnel_id))
          .map(step => ({
            ...step,
            id: undefined, // Let DB generate new ID
            funnel_id: funnelIdMap.get(step.funnel_id),
          }));
        
        if (stepsToInsert.length > 0) {
          const { error } = await supabase.from('funnel_steps').insert(stepsToInsert);
          if (error) throw error;
        }
      }

      // Import triggers
      if (data.triggers.length > 0) {
        const triggersToInsert = data.triggers.map(trigger => ({
          ...trigger,
          id: undefined, // Let DB generate new ID
          user_id: user.id,
        }));
        const { error } = await supabase.from('triggers').insert(triggersToInsert);
        if (error) throw error;
      }

      // Invalidate all queries
      queryClient.invalidateQueries({ queryKey: ['funnels'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      queryClient.invalidateQueries({ queryKey: ['triggers'] });

      await fetchStats();
      toast.success('Backup importado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao importar backup: ' + error.message);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const clearBackupData = () => {
    setBackupData(null);
  };

  return {
    stats,
    backupData,
    isGenerating,
    isImporting,
    fetchStats,
    generateBackup,
    downloadBackup,
    importBackup,
    clearBackupData,
  };
}
