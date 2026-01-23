import { useState } from "react";
import { Send, Paperclip, Mic, MoreVertical, Phone, Video, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lead, Message, Funnel } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { FunnelQuickActions } from "./FunnelQuickActions";

interface ChatAreaProps {
  lead: Lead | null;
  messages: Message[];
  funnels: Funnel[];
  onSendMessage: (content: string) => void;
  onTriggerFunnel: (funnelId: string) => void;
}

export function ChatArea({ lead, messages, funnels, onSendMessage, onTriggerFunnel }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  if (!lead) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
            <Send className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
          <p className="text-muted-foreground">Escolha um lead para começar a conversar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-[var(--header-height)] flex items-center justify-between px-6 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <span className="font-semibold">
              {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold">{lead.name}</h2>
            <p className="text-xs text-muted-foreground">{lead.phone}</p>
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

      {/* Funnel Quick Actions */}
      <FunnelQuickActions funnels={funnels} onTrigger={onTriggerFunnel} />

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
    </div>
  );
}