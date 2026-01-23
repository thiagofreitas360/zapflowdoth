import { useRef, useEffect } from "react";
import { Workflow, ChevronRight, Sparkles, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Funnel } from "@/types/database";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LocalActiveFunnel {
  funnelId: string;
  leadId: string;
  startTime: number;
  remainingSeconds: number;
  currentStep: number;
}

interface FunnelQuickActionsProps {
  funnels: Funnel[];
  filterText: string;
  activeFunnel: LocalActiveFunnel | null;
  onTrigger: (funnelId: string) => void;
  onCancelFunnel: () => void;
}

export function FunnelQuickActions({ 
  funnels, 
  filterText, 
  activeFunnel, 
  onTrigger,
  onCancelFunnel 
}: FunnelQuickActionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredFunnels = filterText.trim()
    ? funnels.filter((f) => 
        f.name.toLowerCase().includes(filterText.toLowerCase())
      )
    : funnels;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (activeFunnel) {
    const funnel = funnels.find((f) => f.id === activeFunnel.funnelId);
    const progress = funnel 
      ? ((funnel.total_duration_seconds - activeFunnel.remainingSeconds) / funnel.total_duration_seconds) * 100
      : 0;

    return (
      <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-warning flex-shrink-0">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="font-medium">Funil ativo:</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: funnel?.color }}>
                {funnel?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(activeFunnel.remainingSeconds)} restante
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelFunnel}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground flex-shrink-0">
        <Workflow className="w-4 h-4" />
        <span>Funis rápidos:</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="relative overflow-x-auto pb-2"
      >
        <div className="flex items-center gap-2 min-w-max">
          {filteredFunnels.length === 0 ? (
            <span className="text-sm text-muted-foreground italic py-2">
              Nenhum funil encontrado
            </span>
          ) : (
            filteredFunnels.map((funnel) => (
              <Button
                key={funnel.id}
                onClick={() => onTrigger(funnel.id)}
                variant="outline"
                size="sm"
                className={cn(
                  "flex-shrink-0 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-200 group whitespace-nowrap"
                )}
                style={{ 
                  borderLeftColor: funnel.color,
                  borderLeftWidth: "3px" 
                }}
              >
                <span>{funnel.name}</span>
                <ChevronRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
