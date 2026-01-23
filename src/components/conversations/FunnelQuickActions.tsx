import { useState } from "react";
import { Workflow, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Funnel } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FunnelQuickActionsProps {
  funnels: Funnel[];
  onTrigger: (funnelId: string) => void;
}

export function FunnelQuickActions({ funnels, onTrigger }: FunnelQuickActionsProps) {
  const [triggeredId, setTriggeredId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTrigger = (funnel: Funnel) => {
    setTriggeredId(funnel.id);
    onTrigger(funnel.id);
    
    toast({
      title: "Funil disparado! 🚀",
      description: `"${funnel.name}" será enviado em instantes.`,
    });

    setTimeout(() => setTriggeredId(null), 1500);
  };

  return (
    <div className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <Workflow className="w-4 h-4" />
          <span>Funis:</span>
        </div>
        {funnels.map((funnel) => (
          <Button
            key={funnel.id}
            onClick={() => handleTrigger(funnel)}
            variant="outline"
            size="sm"
            className={cn(
              "flex-shrink-0 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-200 group",
              triggeredId === funnel.id && "pulse-success bg-accent/20 border-accent"
            )}
            style={{ 
              borderLeftColor: funnel.color,
              borderLeftWidth: "3px" 
            }}
          >
            <span>{funnel.name}</span>
            <ChevronRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 text-primary hover:text-primary hover:bg-primary/10"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Sugestão AI
        </Button>
      </div>
    </div>
  );
}