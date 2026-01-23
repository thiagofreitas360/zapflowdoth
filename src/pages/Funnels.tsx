import { useState } from "react";
import { Plus, Workflow, Play, MoreVertical, Clock, FileText, Mic, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { funnels, FunnelStep } from "@/data/mockData";
import { cn } from "@/lib/utils";

const stepIcons = {
  text: FileText,
  audio: Mic,
  image: Image,
  document: FileText,
  delay: Clock,
};

export default function Funnels() {
  const [selectedFunnelId, setSelectedFunnelId] = useState<string | null>(null);
  const selectedFunnel = funnels.find((f) => f.id === selectedFunnelId);

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
          {funnels.map((funnel, index) => (
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
                  {funnel.steps.map((step, i) => {
                    const Icon = stepIcons[step.type];
                    return (
                      <div
                        key={step.id}
                        className="w-7 h-7 rounded bg-secondary flex items-center justify-center"
                        title={step.type}
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
                  <StepItem key={step.id} step={step} index={index} />
                ))}
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              <Workflow className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Selecione um funil para ver as etapas</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StepItem({ step, index }: { step: FunnelStep; index: number }) {
  const Icon = stepIcons[step.type];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground capitalize">{step.type}</span>
          {step.delay && (
            <span className="text-xs text-warning">+{step.delay}min</span>
          )}
        </div>
        <p className="text-sm truncate">{step.content}</p>
      </div>
    </div>
  );
}