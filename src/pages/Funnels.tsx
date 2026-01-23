import { useState, useRef } from "react";
import { 
  Plus, 
  Clock, 
  FileText, 
  Mic, 
  Image, 
  MessageCircleQuestion,
  GripVertical,
  Trash2,
  Edit2,
  Keyboard,
  Upload,
  X,
  Search,
  Heart,
  ChevronRight,
  MessageSquare,
  Play,
  Loader2,
  MoreVertical,
  Copy,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Funnel, FunnelStep, StepType, QuestionSettings } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFunnels, useCreateFunnel, useUpdateFunnel, useDeleteFunnel, useCreateFunnelStep, useUpdateFunnelStep, useDeleteFunnelStep, useReorderFunnelSteps, useDuplicateFunnel, useRenameFunnel } from "@/hooks/useFunnels";
import { useToast } from "@/hooks/use-toast";

const stepIcons: Record<StepType, typeof FileText> = {
  text: FileText,
  audio: Mic,
  image: Image,
  document: FileText,
  delay: Clock,
  question: MessageCircleQuestion,
};

const stepLabels: Record<StepType, string> = {
  text: "Texto",
  audio: "Áudio",
  image: "Imagem",
  document: "Documento",
  delay: "Delay",
  question: "Pergunta",
};

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
}

function countStepTypes(steps: FunnelStep[] = []) {
  return {
    audio: steps.filter(s => s.type === "audio").length,
    image: steps.filter(s => s.type === "image").length,
    text: steps.filter(s => s.type === "text").length,
    document: steps.filter(s => s.type === "document").length,
  };
}

export default function Funnels() {
  const { data: funnels = [], isLoading } = useFunnels();
  const createFunnel = useCreateFunnel();
  const updateFunnel = useUpdateFunnel();
  const deleteFunnel = useDeleteFunnel();
  const duplicateFunnel = useDuplicateFunnel();
  const renameFunnel = useRenameFunnel();
  const createStep = useCreateFunnelStep();
  const updateStep = useUpdateFunnelStep();
  const deleteStep = useDeleteFunnelStep();
  const reorderSteps = useReorderFunnelSteps();
  const { toast } = useToast();

  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingFunnel, setIsAddingFunnel] = useState(false);
  const [newStepType, setNewStepType] = useState<StepType>("text");
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newFunnelName, setNewFunnelName] = useState("");
  const [newFunnelDescription, setNewFunnelDescription] = useState("");
  const [newFunnelColor, setNewFunnelColor] = useState("#6E56CF");
  
  // Rename dialog state
  const [isRenamingFunnel, setIsRenamingFunnel] = useState(false);
  const [renamingFunnelId, setRenamingFunnelId] = useState<string | null>(null);
  const [renamingFunnelName, setRenamingFunnelName] = useState("");

  const selectedFunnel = funnels.find((f) => f.id === selectedFunnelId);

  const filteredFunnels = funnels.filter(funnel => 
    funnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (funnel.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFunnel = async () => {
    if (!newFunnelName.trim()) return;
    
    try {
      await createFunnel.mutateAsync({
        name: newFunnelName.trim(),
        description: newFunnelDescription.trim() || undefined,
        color: newFunnelColor,
      });
      setNewFunnelName("");
      setNewFunnelDescription("");
      setNewFunnelColor("#6E56CF");
      setIsAddingFunnel(false);
      toast({ title: "Funil criado!", description: "Seu novo funil foi criado com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao criar funil." });
    }
  };

  const handleToggleFavorite = async (funnel: Funnel) => {
    await updateFunnel.mutateAsync({ id: funnel.id, is_favorite: !funnel.is_favorite });
  };

  const handleDuplicateFunnel = async (funnelId: string) => {
    await duplicateFunnel.mutateAsync(funnelId);
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    try {
      await deleteFunnel.mutateAsync(funnelId);
      if (selectedFunnelId === funnelId) {
        setSelectedFunnelId(null);
      }
      toast({ title: "Funil excluído!", description: "O funil foi removido com sucesso." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao excluir funil." });
    }
  };

  const handleOpenRenameDialog = (funnel: Funnel) => {
    setRenamingFunnelId(funnel.id);
    setRenamingFunnelName(funnel.name);
    setIsRenamingFunnel(true);
  };

  const handleRenameFunnel = async () => {
    if (!renamingFunnelId || !renamingFunnelName.trim()) return;
    
    try {
      await renameFunnel.mutateAsync({ id: renamingFunnelId, name: renamingFunnelName.trim() });
      setIsRenamingFunnel(false);
      setRenamingFunnelId(null);
      setRenamingFunnelName("");
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleAddStep = async (funnelId: string, type: StepType) => {
    const maxOrder = selectedFunnel?.steps?.length || 0;
    
    try {
      await createStep.mutateAsync({
        funnel_id: funnelId,
        type,
        content: type === "delay" ? "Aguardar" : type === "question" ? "Sua pergunta aqui" : "",
        delay_minutes: type === "delay" ? 5 : 0,
        show_typing: type === "delay",
        order_position: maxOrder,
        question_settings: type === "question" ? {
          enabled: true,
          questionText: "Sua pergunta aqui",
          waitMinutes: 5,
          autoResponseText: "Mensagem automática caso não responda",
        } : undefined,
      });
      setIsAddingStep(false);
      toast({ title: "Etapa adicionada!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao adicionar etapa." });
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await deleteStep.mutateAsync(stepId);
      toast({ title: "Etapa removida!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao remover etapa." });
    }
  };

  const handleStepReorder = async (funnelId: string, fromIndex: number, toIndex: number) => {
    const funnel = funnels.find(f => f.id === funnelId);
    if (!funnel?.steps) return;

    const newSteps = [...funnel.steps];
    const [movedStep] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedStep);

    const updates = newSteps.map((step, index) => ({
      id: step.id,
      order_position: index,
    }));

    await reorderSteps.mutateAsync(updates);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Funis</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas sequências automáticas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddingFunnel(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary border-0"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Funnel List */}
        <div className="w-[55%] border-r border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredFunnels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-muted-foreground mb-2">Nenhum funil encontrado</p>
                <Button onClick={() => setIsAddingFunnel(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro funil
                </Button>
              </div>
            ) : (
              filteredFunnels.map((funnel, index) => {
                const stepCounts = countStepTypes(funnel.steps);
                const isSelected = selectedFunnelId === funnel.id;
                
                return (
                  <div
                    key={funnel.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedFunnelId(funnel.id)}
                    className={cn(
                      "group flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all",
                      "bg-card border border-border hover:border-primary/50",
                      isSelected && "border-primary bg-primary/5",
                      draggedIndex === index && "opacity-50"
                    )}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: funnel.color }} />
                        <span className="font-semibold truncate">{funnel.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(funnel.total_duration_seconds)}
                        </span>
                        {stepCounts.audio > 0 && (
                          <span className="flex items-center gap-1">
                            <Mic className="w-3 h-3" />
                            {stepCounts.audio}
                          </span>
                        )}
                        {stepCounts.image > 0 && (
                          <span className="flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            {stepCounts.image}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {funnel.steps?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 transition-colors",
                          funnel.is_favorite ? "text-pink-500 hover:text-pink-600" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(funnel);
                        }}
                      >
                        <Heart className={cn("w-4 h-4", funnel.is_favorite && "fill-current")} />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem 
                            onClick={() => handleOpenRenameDialog(funnel)}
                            className="gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicateFunnel(funnel.id)}
                            className="gap-2"
                            disabled={duplicateFunnel.isPending}
                          >
                            <Copy className="w-4 h-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteFunnel(funnel.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                            disabled={deleteFunnel.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        isSelected && "text-primary rotate-90"
                      )} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Funnel Detail Panel */}
        <div className="w-[45%] flex flex-col overflow-hidden bg-card/50">
          {selectedFunnel ? (
            <>
              <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedFunnel.color }} />
                  <h3 className="font-semibold truncate">{selectedFunnel.name}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() => setIsAddingStep(true)}
                >
                  <Plus className="w-3 h-3" />
                  Adicionar item
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(selectedFunnel.steps || []).map((step, index) => (
                  <StepItemRow
                    key={step.id}
                    step={step}
                    index={index}
                    funnelId={selectedFunnel.id}
                    onEdit={setEditingStep}
                    onDelete={handleDeleteStep}
                    onReorder={handleStepReorder}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Selecione um funil para ver as etapas</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Funnel Dialog */}
      <Dialog open={isAddingFunnel} onOpenChange={setIsAddingFunnel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Funil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="funnelName">Nome *</Label>
              <Input
                id="funnelName"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                placeholder="Nome do funil"
                className="mt-2 bg-secondary border-0"
              />
            </div>
            <div>
              <Label htmlFor="funnelDesc">Descrição</Label>
              <Textarea
                id="funnelDesc"
                value={newFunnelDescription}
                onChange={(e) => setNewFunnelDescription(e.target.value)}
                placeholder="Descrição opcional"
                className="mt-2 bg-secondary border-0"
                rows={2}
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["#6E56CF", "#00B37E", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899", "#06B6D4", "#8B5CF6"].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newFunnelColor === color ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewFunnelColor(color)}
                  />
                ))}
              </div>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleCreateFunnel}
              disabled={!newFunnelName.trim() || createFunnel.isPending}
            >
              {createFunnel.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Funil
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Funnel Dialog */}
      <Dialog open={isRenamingFunnel} onOpenChange={setIsRenamingFunnel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Funil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="renameFunnelName">Nome</Label>
              <Input
                id="renameFunnelName"
                value={renamingFunnelName}
                onChange={(e) => setRenamingFunnelName(e.target.value)}
                placeholder="Nome do funil"
                className="mt-2 bg-secondary border-0"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setIsRenamingFunnel(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleRenameFunnel}
                disabled={!renamingFunnelName.trim() || renameFunnel.isPending}
              >
                {renameFunnel.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-2">
              {(["text", "delay", "question", "audio", "image", "document"] as const).map((type) => {
                const Icon = stepIcons[type];
                return (
                  <Button
                    key={type}
                    variant={newStepType === type ? "default" : "outline"}
                    className="flex flex-col h-20 gap-2"
                    onClick={() => setNewStepType(type)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{stepLabels[type]}</span>
                  </Button>
                );
              })}
            </div>
            <Button 
              className="w-full"
              onClick={() => selectedFunnel && handleAddStep(selectedFunnel.id, newStepType)}
              disabled={createStep.isPending}
            >
              {createStep.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar {stepLabels[newStepType]}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={!!editingStep} onOpenChange={(open) => !open && setEditingStep(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          {editingStep && selectedFunnel && (
            <EditStepForm
              step={editingStep}
              onUpdate={async (stepId, updates) => {
                await updateStep.mutateAsync({ id: stepId, ...updates });
                setEditingStep(null);
              }}
              onClose={() => setEditingStep(null)}
              isPending={updateStep.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StepItemRowProps {
  step: FunnelStep;
  index: number;
  funnelId: string;
  onEdit: (step: FunnelStep) => void;
  onDelete: (stepId: string) => void;
  onReorder: (funnelId: string, fromIndex: number, toIndex: number) => void;
}

function StepItemRow({ step, index, funnelId, onEdit, onDelete, onReorder }: StepItemRowProps) {
  const Icon = stepIcons[step.type];
  const [draggedOver, setDraggedOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("stepIndex", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    const fromIndex = parseInt(e.dataTransfer.getData("stepIndex"));
    if (fromIndex !== index) {
      onReorder(funnelId, fromIndex, index);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg transition-all",
        "bg-secondary/80 border border-border/50 hover:border-primary/30",
        draggedOver && "border-primary bg-primary/10"
      )}
    >
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{stepLabels[step.type].toUpperCase()} {index + 1}</span>
          {step.show_typing && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
            </span>
          )}
        </div>
        {step.type === "delay" && step.delay_minutes > 0 && (
          <p className="text-xs text-muted-foreground">Enviando após {step.delay_minutes}min</p>
        )}
        {step.type === "text" && (
          <p className="text-xs text-muted-foreground truncate">{step.content}</p>
        )}
        {step.type === "question" && step.question_settings && (
          <p className="text-xs text-muted-foreground truncate">{step.question_settings.questionText}</p>
        )}
        {["audio", "image", "document"].includes(step.type) && step.file_name && (
          <p className="text-xs text-accent truncate">{step.file_name}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-primary/80 hover:bg-primary text-primary-foreground"
          onClick={() => onEdit(step)}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onDelete(step.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface EditStepFormProps {
  step: FunnelStep;
  onUpdate: (stepId: string, updates: Partial<FunnelStep>) => Promise<void>;
  onClose: () => void;
  isPending: boolean;
}

function EditStepForm({ step, onUpdate, onClose, isPending }: EditStepFormProps) {
  const [content, setContent] = useState(step.content);
  const [delay, setDelay] = useState(step.delay_minutes || 5);
  const [showTyping, setShowTyping] = useState(step.show_typing || false);
  const [questionText, setQuestionText] = useState(step.question_settings?.questionText || "");
  const [waitMinutes, setWaitMinutes] = useState(step.question_settings?.waitMinutes || 5);
  const [autoResponse, setAutoResponse] = useState(step.question_settings?.autoResponseText || "");
  const [fileName, setFileName] = useState(step.file_name || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMediaType = ["audio", "image", "document"].includes(step.type);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setContent(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAcceptedFileTypes = () => {
    switch (step.type) {
      case "audio": return "audio/*";
      case "image": return "image/*";
      case "document": return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";
      default: return "";
    }
  };

  const handleSave = async () => {
    const updates: Partial<FunnelStep> = {
      content,
      show_typing: showTyping,
    };

    if (step.type === "delay") {
      updates.delay_minutes = delay;
    }

    if (step.type === "question") {
      updates.question_settings = {
        enabled: true,
        questionText,
        waitMinutes,
        autoResponseText: autoResponse,
      };
      updates.content = questionText;
    }

    if (isMediaType) {
      updates.file_name = fileName;
      updates.content = fileName || content;
    }

    await onUpdate(step.id, updates);
  };

  return (
    <div className="space-y-4 py-4">
      {isMediaType && (
        <div>
          <Label>
            {step.type === "audio" && "Arquivo de Áudio"}
            {step.type === "image" && "Arquivo de Imagem"}
            {step.type === "document" && "Documento"}
          </Label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedFileTypes()}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {fileName ? (
            <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-secondary border border-border">
              <div className="flex-1 flex items-center gap-2">
                {step.type === "audio" && <Mic className="w-5 h-5 text-primary" />}
                {step.type === "image" && <Image className="w-5 h-5 text-primary" />}
                {step.type === "document" && <FileText className="w-5 h-5 text-primary" />}
                <span className="text-sm truncate">{fileName}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleRemoveFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full mt-2 h-20 border-dashed flex flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Clique para fazer upload</span>
            </Button>
          )}
        </div>
      )}

      {step.type === "text" && (
        <div>
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="mt-2 bg-secondary border-0" rows={3} />
        </div>
      )}

      {step.type === "delay" && (
        <div>
          <Label htmlFor="delay">Tempo de espera (minutos)</Label>
          <Input id="delay" type="number" min={1} max={60} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="mt-2 bg-secondary border-0" />
        </div>
      )}

      {(step.type === "delay" || step.type === "text" || isMediaType) && (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Mostrar "digitando..."</p>
            <p className="text-sm text-muted-foreground">Exibe indicador no WhatsApp</p>
          </div>
          <Switch checked={showTyping} onCheckedChange={setShowTyping} />
        </div>
      )}

      {step.type === "question" && (
        <>
          <div>
            <Label htmlFor="questionText">Pergunta</Label>
            <Textarea id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="mt-2 bg-secondary border-0" rows={2} />
          </div>
          <div>
            <Label htmlFor="wait">Tempo de espera (minutos)</Label>
            <Input id="wait" type="number" min={1} max={60} value={waitMinutes} onChange={(e) => setWaitMinutes(Number(e.target.value))} className="mt-2 bg-secondary border-0" />
          </div>
          <div>
            <Label htmlFor="autoResponse">Mensagem automática</Label>
            <Textarea id="autoResponse" value={autoResponse} onChange={(e) => setAutoResponse(e.target.value)} className="mt-2 bg-secondary border-0" rows={2} />
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar
        </Button>
      </div>
    </div>
  );
}
