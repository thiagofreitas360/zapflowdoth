import { useRef, useEffect } from "react";
import { Workflow, ChevronRight, Sparkles, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Funnel, ActiveFunnel } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface FunnelQuickActionsProps {
  funnels: Funnel[];
  filterText: string;
  activeFunnel: ActiveFunnel | null;
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

  // Filter funnels based on input text
  const filteredFunnels = filterText.trim()
    ? funnels.filter((f) => 
        f.name.toLowerCase().includes(filterText.toLowerCase())
      )
    : funnels;

  // Enable horizontal scroll with mouse wheel
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

  // Show active funnel status
  if (activeFunnel) {
    const funnel = funnels.find((f) => f.id === activeFunnel.funnelId);
    const progress = funnel 
      ? ((funnel.totalDurationSeconds - activeFunnel.remainingSeconds) / funnel.totalDurationSeconds) * 100
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
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
          <Workflow className="w-4 h-4" />
          <span>Funis:</span>
        </div>
        
        {filteredFunnels.length === 0 ? (
          <span className="text-sm text-muted-foreground italic">
            Nenhum funil encontrado para "{filterText}"
          </span>
        ) : (
          filteredFunnels.map((funnel) => (
            <Button
              key={funnel.id}
              onClick={() => onTrigger(funnel.id)}
              variant="outline"
              size="sm"
              className={cn(
                "flex-shrink-0 border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
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
        
        {!filterText.trim() && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Sugestão AI
          </Button>
        )}
      </div>
    </div>
  );
}
