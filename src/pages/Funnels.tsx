import { useState } from "react";
import { 
  Plus, 
  Workflow, 
  Play, 
  MoreVertical, 
  Clock, 
  FileText, 
  Mic, 
  Image, 
  MessageCircleQuestion,
  GripVertical,
  Trash2,
  Edit2,
  Keyboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { funnels as initialFunnels, FunnelStep, Funnel } from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const stepIcons = {
  text: FileText,
  audio: Mic,
  image: Image,
  document: FileText,
  delay: Clock,
  question: MessageCircleQuestion,
};

const stepLabels = {
  text: "Texto",
  audio: "Áudio",
  image: "Imagem",
  document: "Documento",
  delay: "Delay",
  question: "Pergunta",
};

export default function Funnels() {
  const [funnelsList, setFunnelsList] = useState<Funnel[]>(initialFunnels);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepType, setNewStepType] = useState<FunnelStep["type"]>("text");

  const selectedFunnel = funnelsList.find((f) => f.id === selectedFunnelId);

  const handleUpdateStep = (funnelId: string, stepId: string, updates: Partial<FunnelStep>) => {
    setFunnelsList((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        return {
          ...funnel,
          steps: funnel.steps.map((step) =>
            step.id === stepId ? { ...step, ...updates } : step
          ),
        };
      })
    );
  };

  const handleAddStep = (funnelId: string, type: FunnelStep["type"]) => {
    const newStep: FunnelStep = {
      id: `s${Date.now()}`,
      type,
      content: type === "delay" ? "Aguardar" : type === "question" ? "Sua pergunta aqui" : "Nova mensagem",
      delay: type === "delay" ? 5 : undefined,
      showTypingIndicator: type === "delay",
      question: type === "question" ? {
        enabled: true,
        questionText: "Sua pergunta aqui",
        waitMinutes: 5,
        autoResponseText: "Mensagem automática caso não responda",
      } : undefined,
    };

    setFunnelsList((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        return {
          ...funnel,
          steps: [...funnel.steps, newStep],
        };
      })
    );
    setIsAddingStep(false);
  };

  const handleDeleteStep = (funnelId: string, stepId: string) => {
    setFunnelsList((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        return {
          ...funnel,
          steps: funnel.steps.filter((step) => step.id !== stepId),
        };
      })
    );
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Funis de Mensagens</h1>
          <p className="text-muted-foreground">Configure sequências automáticas para seus leads</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Funil
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Funnel Cards */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {funnelsList.map((funnel, index) => (
            <Card
              key={funnel.id}
              onClick={() => setSelectedFunnelId(funnel.id)}
              className={cn(
                "funnel-card cursor-pointer animate-fade-in",
                selectedFunnelId === funnel.id && "border-primary bg-primary/5"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${funnel.color}20` }}
                >
                  <Workflow className="w-5 h-5" style={{ color: funnel.color }} />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="font-semibold text-lg mb-1">{funnel.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{funnel.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Conversões: </span>
                    <span className="font-semibold text-accent">{funnel.conversions}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Enviados: </span>
                    <span className="font-semibold">{funnel.totalSent}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                  <Play className="w-4 h-4" />
                </Button>
              </div>

              {/* Steps Preview */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">{funnel.steps.length} etapas</p>
                <div className="flex items-center gap-1">
                  {funnel.steps.map((step) => {
                    const Icon = stepIcons[step.type];
                    return (
                      <div
                        key={step.id}
                        className="w-7 h-7 rounded bg-secondary flex items-center justify-center"
                        title={stepLabels[step.type]}
                      >
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}

          {/* Add New Card */}
          <Card className="funnel-card border-dashed cursor-pointer flex flex-col items-center justify-center min-h-[200px] hover:border-primary/50 hover:bg-primary/5 transition-all">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Criar novo funil</p>
          </Card>
        </div>

        {/* Funnel Detail Panel */}
        <div className="lg:col-span-1">
          {selectedFunnel ? (
            <Card className="p-6 animate-scale-in">
              <h3 className="font-semibold text-lg mb-4">Etapas do Funil</h3>
              <div className="space-y-3">
                {selectedFunnel.steps.map((step, index) => (
                  <StepItem 
                    key={step.id} 
                    step={step} 
                    index={index}
                    funnelId={selectedFunnel.id}
                    onUpdate={handleUpdateStep}
                    onDelete={handleDeleteStep}
                    onEdit={setEditingStep}
                  />
                ))}
              </div>
              
              {/* Add Step Dialog */}
              <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Etapa
                  </Button>
                </DialogTrigger>
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
                      onClick={() => handleAddStep(selectedFunnel.id, newStepType)}
                    >
                      Adicionar {stepLabels[newStepType]}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Workflow className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Selecione um funil para ver as etapas</p>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Step Dialog */}
      <Dialog open={!!editingStep} onOpenChange={(open) => !open && setEditingStep(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          {editingStep && selectedFunnel && (
            <EditStepForm
              step={editingStep}
              funnelId={selectedFunnel.id}
              onUpdate={handleUpdateStep}
              onClose={() => setEditingStep(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StepItemProps {
  step: FunnelStep;
  index: number;
  funnelId: string;
  onUpdate: (funnelId: string, stepId: string, updates: Partial<FunnelStep>) => void;
  onDelete: (funnelId: string, stepId: string) => void;
  onEdit: (step: FunnelStep) => void;
}

function StepItem({ step, index, funnelId, onUpdate, onDelete, onEdit }: StepItemProps) {
  const Icon = stepIcons[step.type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 group hover:border-primary/30 transition-colors">
      <div className="flex flex-col items-center gap-1">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {stepLabels[step.type]}
          </span>
          {step.delay && (
            <span className="text-xs text-warning">+{step.delay}min</span>
          )}
          {step.showTypingIndicator && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              digitando...
            </span>
          )}
        </div>
        <p className="text-sm truncate">{step.content}</p>
        
        {/* Question details */}
        {step.type === "question" && step.question && (
          <div className="mt-2 p-2 rounded bg-background/50 text-xs space-y-1">
            <p className="text-muted-foreground">
              ⏱️ Aguarda: {step.question.waitMinutes} min
            </p>
            <p className="text-muted-foreground truncate">
              💬 Auto: {step.question.autoResponseText}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onEdit(step)}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(funnelId, step.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface EditStepFormProps {
  step: FunnelStep;
  funnelId: string;
  onUpdate: (funnelId: string, stepId: string, updates: Partial<FunnelStep>) => void;
  onClose: () => void;
}

function EditStepForm({ step, funnelId, onUpdate, onClose }: EditStepFormProps) {
  const [content, setContent] = useState(step.content);
  const [delay, setDelay] = useState(step.delay || 5);
  const [showTyping, setShowTyping] = useState(step.showTypingIndicator || false);
  const [questionText, setQuestionText] = useState(step.question?.questionText || "");
  const [waitMinutes, setWaitMinutes] = useState(step.question?.waitMinutes || 5);
  const [autoResponse, setAutoResponse] = useState(step.question?.autoResponseText || "");

  const handleSave = () => {
    const updates: Partial<FunnelStep> = {
      content,
      showTypingIndicator: showTyping,
    };

    if (step.type === "delay") {
      updates.delay = delay;
    }

    if (step.type === "question") {
      updates.question = {
        enabled: true,
        questionText,
        waitMinutes,
        autoResponseText: autoResponse,
      };
    }

    onUpdate(funnelId, step.id, updates);
    onClose();
  };

  return (
    <div className="space-y-4 py-4">
      {/* Content */}
      {step.type !== "delay" && (
        <div>
          <Label htmlFor="content">
            {step.type === "question" ? "Pergunta" : "Conteúdo"}
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-2 bg-secondary border-0"
            rows={3}
          />
        </div>
      )}

      {/* Delay settings */}
      {step.type === "delay" && (
        <div>
          <Label htmlFor="delay">Tempo de espera (minutos)</Label>
          <Input
            id="delay"
            type="number"
            min={1}
            max={60}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="mt-2 bg-secondary border-0"
          />
        </div>
      )}

      {/* Show typing indicator */}
      {(step.type === "delay" || step.type === "text") && (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Mostrar "digitando..."</p>
            <p className="text-sm text-muted-foreground">
              Exibe indicador de digitação no WhatsApp do lead
            </p>
          </div>
          <Switch
            checked={showTyping}
            onCheckedChange={setShowTyping}
          />
        </div>
      )}

      {/* Question settings */}
      {step.type === "question" && (
        <>
          <div>
            <Label htmlFor="wait">Tempo de espera pela resposta (minutos)</Label>
            <Input
              id="wait"
              type="number"
              min={1}
              max={60}
              value={waitMinutes}
              onChange={(e) => setWaitMinutes(Number(e.target.value))}
              className="mt-2 bg-secondary border-0"
            />
          </div>
          <div>
            <Label htmlFor="autoResponse">Mensagem automática (se não responder)</Label>
            <Textarea
              id="autoResponse"
              value={autoResponse}
              onChange={(e) => setAutoResponse(e.target.value)}
              className="mt-2 bg-secondary border-0"
              rows={2}
              placeholder="Mensagem enviada automaticamente após o timeout..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Após enviar, o funil será pausado aguardando interação manual.
            </p>
          </div>
        </>
      )}

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
