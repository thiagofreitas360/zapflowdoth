import { useState } from "react";
import { Link, MessageSquare, UserCheck, Plus, ArrowRight, Loader2, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTriggers, useCreateTrigger, useUpdateTrigger, useDeleteTrigger, useToggleTrigger } from "@/hooks/useTriggers";
import { useFunnels } from "@/hooks/useFunnels";
import { useToast } from "@/hooks/use-toast";
import { Trigger } from "@/types/database";

const iconMap: Record<string, typeof Link> = {
  Link: Link,
  MessageSquare: MessageSquare,
  UserCheck: UserCheck,
};

export default function Triggers() {
  const { data: triggers = [], isLoading } = useTriggers();
  const { data: funnels = [] } = useFunnels();
  const createTrigger = useCreateTrigger();
  const updateTrigger = useUpdateTrigger();
  const deleteTrigger = useDeleteTrigger();
  const toggleTrigger = useToggleTrigger();
  const { toast } = useToast();

  const [isAddingTrigger, setIsAddingTrigger] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [newTriggerName, setNewTriggerName] = useState("");
  const [newTriggerDescription, setNewTriggerDescription] = useState("");
  const [newTriggerIcon, setNewTriggerIcon] = useState("Link");
  const [newTriggerAction, setNewTriggerAction] = useState("");

  const handleCreateTrigger = async () => {
    if (!newTriggerName.trim() || !newTriggerAction.trim()) return;
    
    try {
      await createTrigger.mutateAsync({
        name: newTriggerName.trim(),
        description: newTriggerDescription.trim() || undefined,
        icon: newTriggerIcon,
        action: newTriggerAction.trim(),
        is_active: true,
      });
      resetForm();
      setIsAddingTrigger(false);
      toast({ title: "Gatilho criado!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao criar gatilho." });
    }
  };

  const handleUpdateTrigger = async () => {
    if (!editingTrigger || !newTriggerName.trim() || !newTriggerAction.trim()) return;
    
    try {
      await updateTrigger.mutateAsync({
        id: editingTrigger.id,
        name: newTriggerName.trim(),
        description: newTriggerDescription.trim() || undefined,
        icon: newTriggerIcon,
        action: newTriggerAction.trim(),
      });
      resetForm();
      setEditingTrigger(null);
      toast({ title: "Gatilho atualizado!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar." });
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    try {
      await deleteTrigger.mutateAsync(id);
      toast({ title: "Gatilho removido!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao remover." });
    }
  };

  const handleToggle = async (trigger: Trigger) => {
    await toggleTrigger.mutateAsync({ id: trigger.id, is_active: !trigger.is_active });
  };

  const resetForm = () => {
    setNewTriggerName("");
    setNewTriggerDescription("");
    setNewTriggerIcon("Link");
    setNewTriggerAction("");
  };

  const openEditDialog = (trigger: Trigger) => {
    setNewTriggerName(trigger.name);
    setNewTriggerDescription(trigger.description || "");
    setNewTriggerIcon(trigger.icon);
    setNewTriggerAction(trigger.action);
    setEditingTrigger(trigger);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gatilhos e Automações</h1>
          <p className="text-muted-foreground">Configure ações automáticas baseadas no comportamento dos leads</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddingTrigger(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Gatilho
        </Button>
      </div>

      {/* Triggers List */}
      <div className="space-y-4 max-w-3xl">
        {triggers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhum gatilho configurado</p>
            <Button onClick={() => setIsAddingTrigger(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro gatilho
            </Button>
          </Card>
        ) : (
          triggers.map((trigger, index) => {
            const IconComponent = iconMap[trigger.icon] || Link;
            return (
              <Card
                key={trigger.id}
                className="p-5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{trigger.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${trigger.is_active ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        {trigger.is_active ? 'Ativo' : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{trigger.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Ação:</span>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary">
                        <ArrowRight className="w-3 h-3 text-accent" />
                        <span className="font-medium">{trigger.action}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(trigger)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Switch 
                      checked={trigger.is_active} 
                      onCheckedChange={() => handleToggle(trigger)}
                    />
                  </div>
                </div>
              </Card>
            );
          })
        )}

        {/* Add New Trigger Card */}
        <Card 
          className="p-5 border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          onClick={() => setIsAddingTrigger(true)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Criar novo gatilho</h3>
              <p className="text-sm text-muted-foreground">Configure uma nova automação</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Trigger Dialog */}
      <Dialog open={isAddingTrigger || !!editingTrigger} onOpenChange={(open) => {
        if (!open) {
          setIsAddingTrigger(false);
          setEditingTrigger(null);
          resetForm();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrigger ? "Editar Gatilho" : "Novo Gatilho"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={newTriggerName}
                onChange={(e) => setNewTriggerName(e.target.value)}
                placeholder="Ex: Clicou no link"
                className="mt-2 bg-secondary border-0"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newTriggerDescription}
                onChange={(e) => setNewTriggerDescription(e.target.value)}
                placeholder="Descrição do gatilho"
                className="mt-2 bg-secondary border-0"
                rows={2}
              />
            </div>
            <div>
              <Label>Ícone</Label>
              <Select value={newTriggerIcon} onValueChange={setNewTriggerIcon}>
                <SelectTrigger className="mt-2 bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Link">Link</SelectItem>
                  <SelectItem value="MessageSquare">Mensagem</SelectItem>
                  <SelectItem value="UserCheck">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="action">Ação *</Label>
              <Select value={newTriggerAction} onValueChange={setNewTriggerAction}>
                <SelectTrigger className="mt-2 bg-secondary border-0">
                  <SelectValue placeholder="Selecione uma ação" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={`Enviar Funil: ${funnel.name}`}>
                      Enviar Funil: {funnel.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Marcar como: Lead Quente">Marcar como: Lead Quente</SelectItem>
                  <SelectItem value="Marcar como: Lead Frio">Marcar como: Lead Frio</SelectItem>
                  <SelectItem value="Notificar equipe">Notificar equipe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={editingTrigger ? handleUpdateTrigger : handleCreateTrigger}
              disabled={!newTriggerName.trim() || !newTriggerAction.trim() || createTrigger.isPending || updateTrigger.isPending}
            >
              {(createTrigger.isPending || updateTrigger.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTrigger ? "Salvar" : "Criar Gatilho"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
