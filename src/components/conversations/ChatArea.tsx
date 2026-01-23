import { useState, useEffect, useCallback } from "react";
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Mic, 
  Send, 
  Check, 
  CheckCheck,
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead, Message, Funnel, ActiveFunnel } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { FunnelQuickActions } from "./FunnelQuickActions";
import { useToast } from "@/hooks/use-toast";

interface ChatAreaProps {
  lead: Lead | null;
  messages: Message[];
  funnels: Funnel[];
  onSendMessage: (content: string) => void;
  onTriggerFunnel: (funnelId: string) => void;
}

export function ChatArea({ lead, messages, funnels, onSendMessage, onTriggerFunnel }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [activeFunnel, setActiveFunnel] = useState<ActiveFunnel | null>(null);
  const { toast } = useToast();

  // Countdown timer for active funnel
  useEffect(() => {
    if (!activeFunnel) return;

    const interval = setInterval(() => {
      setActiveFunnel((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          toast({
            title: "Funil concluído! ✅",
            description: "Todas as mensagens foram enviadas.",
          });
          return null;
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFunnel, toast]);

  const handleSend = useCallback(() => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  }, [inputValue, onSendMessage]);

  const handleTriggerFunnel = useCallback((funnelId: string) => {
    if (activeFunnel) {
      toast({
        title: "Aguarde! ⏳",
        description: "Já existe um funil em andamento. Cancele-o primeiro.",
        variant: "destructive",
      });
      return;
    }

    const funnel = funnels.find((f) => f.id === funnelId);
    if (!funnel || !lead) return;

    setActiveFunnel({
      funnelId,
      leadId: lead.id,
      startTime: Date.now(),
      remainingSeconds: funnel.totalDurationSeconds,
      currentStep: 0,
    });

    onTriggerFunnel(funnelId);

    toast({
      title: "Funil disparado! 🚀",
      description: `"${funnel.name}" será enviado em ${funnel.totalDurationSeconds}s.`,
    });
  }, [activeFunnel, funnels, lead, onTriggerFunnel, toast]);

  const handleCancelFunnel = useCallback(() => {
    setActiveFunnel(null);
    toast({
      title: "Funil cancelado",
      description: "O envio foi interrompido.",
    });
  }, [toast]);

  if (!lead) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Selecione uma conversa</p>
          <p className="text-sm">Escolha um lead para iniciar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-[var(--header-height)] flex items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {lead.avatar ? (
            <img 
              src={lead.avatar} 
              alt={lead.isSaved ? lead.name : lead.phone}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              {lead.isSaved ? (
                <span className="font-semibold">
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </span>
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          )}
          <div>
            <h2 className="font-semibold">
              {lead.isSaved ? lead.name : lead.phone}
            </h2>
            {lead.isSaved && (
              <p className="text-xs text-muted-foreground">{lead.phone}</p>
            )}
            {/* Labels in header */}
            {lead.labels.length > 0 && (
              <div className="flex gap-1 mt-0.5">
                {lead.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-1.5 py-0.5 text-[9px] font-medium rounded text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-fade-in",
              message.direction === "sent" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "max-w-[70%]",
                message.direction === "sent" ? "chat-bubble-sent" : "chat-bubble-received"
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[10px] text-muted-foreground">{message.timestamp}</span>
                {message.direction === "sent" && (
                  message.status === "read" ? (
                    <CheckCheck className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-muted-foreground" />
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground flex-shrink-0">
            <Mic className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSend}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Funnel Quick Actions - Below input */}
      <FunnelQuickActions 
        funnels={funnels} 
        filterText={inputValue}
        activeFunnel={activeFunnel}
        onTrigger={handleTriggerFunnel}
        onCancelFunnel={handleCancelFunnel}
      />
    </div>
  );
}
