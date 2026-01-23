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
  Play
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

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}min ${seconds}s`;
}

function countStepTypes(steps: FunnelStep[]) {
  return {
    audio: steps.filter(s => s.type === "audio").length,
    image: steps.filter(s => s.type === "image").length,
    text: steps.filter(s => s.type === "text").length,
    document: steps.filter(s => s.type === "document").length,
  };
}

export default function Funnels() {
  const [funnelsList, setFunnelsList] = useState<Funnel[]>(initialFunnels);
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<FunnelStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepType, setNewStepType] = useState<FunnelStep["type"]>("text");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedFunnel = funnelsList.find((f) => f.id === selectedFunnelId);

  const filteredFunnels = funnelsList.filter(funnel => 
    funnel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funnel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (funnelId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(funnelId)) {
        newSet.delete(funnelId);
      } else {
        newSet.add(funnelId);
      }
      return newSet;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newList = [...funnelsList];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    setFunnelsList(newList);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

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
      content: type === "delay" ? "Aguardar" : type === "question" ? "Sua pergunta aqui" : "",
      delay: type === "delay" ? 5 : undefined,
      showTypingIndicator: type === "delay",
      question: type === "question" ? {
        enabled: true,
        questionText: "Sua pergunta aqui",
        waitMinutes: 5,
        autoResponseText: "Mensagem automática caso não responda",
      } : undefined,
      fileUrl: ["audio", "image", "document"].includes(type) ? "" : undefined,
      fileName: ["audio", "image", "document"].includes(type) ? "" : undefined,
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
    
    if (["audio", "image", "document"].includes(type)) {
      setTimeout(() => setEditingStep(newStep), 100);
    }
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

  // Reorder steps via drag
  const handleStepDragStart = (stepIndex: number) => {
    return stepIndex;
  };

  const handleStepReorder = (funnelId: string, fromIndex: number, toIndex: number) => {
    setFunnelsList((prev) =>
      prev.map((funnel) => {
        if (funnel.id !== funnelId) return funnel;
        const newSteps = [...funnel.steps];
        const [movedStep] = newSteps.splice(fromIndex, 1);
        newSteps.splice(toIndex, 0, movedStep);
        return { ...funnel, steps: newSteps };
      })
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Funis</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas sequências automáticas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
        
        {/* Search bar */}
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
            {filteredFunnels.map((funnel, index) => {
              const stepCounts = countStepTypes(funnel.steps);
              const isFavorite = favorites.has(funnel.id);
              const isSelected = selectedFunnelId === funnel.id;
              
              return (
                <div
                  key={funnel.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedFunnelId(funnel.id)}
                  className={cn(
                    "group flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all",
                    "bg-card border border-border hover:border-primary/50",
                    isSelected && "border-primary bg-primary/5",
                    draggedIndex === index && "opacity-50"
                  )}
                >
                  {/* Drag handle */}
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Funnel info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{funnel.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(funnel.totalDurationSeconds)}
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
                        {funnel.steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 transition-colors",
                        isFavorite ? "text-pink-500 hover:text-pink-600" : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(funnel.id);
                      }}
                    >
                      <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFunnelId(funnel.id);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      isSelected && "text-primary rotate-90"
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Funnel Detail Panel */}
        <div className="w-[45%] flex flex-col overflow-hidden bg-card/50">
          {selectedFunnel ? (
            <>
              {/* Detail Header */}
              <div className="flex-shrink-0 p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedFunnel.color }}
                  />
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

              {/* Steps List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {selectedFunnel.steps.map((step, index) => (
                  <StepItemRow
                    key={step.id}
                    step={step}
                    index={index}
                    funnelId={selectedFunnel.id}
                    totalSteps={selectedFunnel.steps.length}
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
            >
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
              funnelId={selectedFunnel.id}
              onUpdate={(funnelId, stepId, updates) => {
                handleUpdateStep(funnelId, stepId, updates);
                setEditingStep((prev) => prev ? { ...prev, ...updates } : null);
              }}
              onClose={() => setEditingStep(null)}
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
  totalSteps: number;
  onEdit: (step: FunnelStep) => void;
  onDelete: (funnelId: string, stepId: string) => void;
  onReorder: (funnelId: string, fromIndex: number, toIndex: number) => void;
}

function StepItemRow({ step, index, funnelId, totalSteps, onEdit, onDelete, onReorder }: StepItemRowProps) {
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

  // Calculate delay display
  const getDelayText = () => {
    if (step.type === "delay" && step.delay) {
      return `Enviando após ${step.delay}min`;
    }
    // Sum delays before this step
    return null;
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
      {/* Drag handle */}
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Icon */}
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{stepLabels[step.type].toUpperCase()} {index + 1}</span>
          {step.showTypingIndicator && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
            </span>
          )}
        </div>
        {step.type === "delay" && step.delay && (
          <p className="text-xs text-muted-foreground">Enviando após {step.delay}min</p>
        )}
        {step.type === "text" && (
          <p className="text-xs text-muted-foreground truncate">{step.content}</p>
        )}
        {step.type === "question" && step.question && (
          <p className="text-xs text-muted-foreground truncate">{step.question.questionText}</p>
        )}
        {["audio", "image", "document"].includes(step.type) && step.fileName && (
          <p className="text-xs text-accent truncate">{step.fileName}</p>
        )}
      </div>

      {/* Actions */}
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
  const [fileName, setFileName] = useState(step.fileName || "");
  const [fileUrl, setFileUrl] = useState(step.fileUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMediaType = ["audio", "image", "document"].includes(step.type);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file));
      setContent(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    setFileUrl("");
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAcceptedFileTypes = () => {
    switch (step.type) {
      case "audio":
        return "audio/*";
      case "image":
        return "image/*";
      case "document":
        return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";
      default:
        return "";
    }
  };

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
      updates.content = questionText;
    }

    if (isMediaType) {
      updates.fileName = fileName;
      updates.fileUrl = fileUrl;
      updates.content = fileName || content;
    }

    onUpdate(funnelId, step.id, updates);
    onClose();
  };

  return (
    <div className="space-y-4 py-4">
      {/* File Upload for media types */}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full mt-2 h-20 border-dashed flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Clique para fazer upload
              </span>
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            {step.type === "audio" && "Formatos aceitos: MP3, OGG, WAV, M4A"}
            {step.type === "image" && "Formatos aceitos: JPG, PNG, GIF, WebP"}
            {step.type === "document" && "Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT"}
          </p>
        </div>
      )}

      {/* Content for text */}
      {step.type === "text" && (
        <div>
          <Label htmlFor="content">Conteúdo</Label>
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
      {(step.type === "delay" || step.type === "text" || isMediaType) && (
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
            <Label htmlFor="questionText">Pergunta</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="mt-2 bg-secondary border-0"
              rows={2}
              placeholder="Digite sua pergunta..."
            />
          </div>
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
