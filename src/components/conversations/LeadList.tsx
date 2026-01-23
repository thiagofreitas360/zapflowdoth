import { useState } from "react";
import { Search, Pin, PinOff, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Lead } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LeadListProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onTogglePin: (leadId: string) => void;
}

const statusColors = {
  hot: "bg-destructive",
  warm: "bg-warning",
  cold: "bg-muted-foreground",
};

export function LeadList({ leads, selectedLeadId, onSelectLead, onTogglePin }: LeadListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.phone.toLowerCase().includes(searchLower) ||
      (lead.isSaved && lead.name.toLowerCase().includes(searchLower)) ||
      lead.labels.some((l) => l.name.toLowerCase().includes(searchLower))
    );
  });

  // Sort: pinned first, then by last message time
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const pinnedCount = leads.filter((l) => l.isPinned).length;

  return (
    <div className="h-full flex flex-col border-r border-border bg-card overflow-hidden">
      {/* Search Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por número, nome ou etiqueta..."
            className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Leads - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {sortedLeads.map((lead, index) => (
          <div
            key={lead.id}
            className={cn(
              "flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-border/50 group",
              "hover:bg-secondary/50",
              selectedLeadId === lead.id && "bg-primary/10 border-l-2 border-l-primary",
              lead.isPinned && "bg-primary/5",
              index === 0 && "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar */}
            <div 
              className="relative flex-shrink-0"
              onClick={() => onSelectLead(lead.id)}
            >
              {lead.avatar ? (
                <img 
                  src={lead.avatar} 
                  alt={lead.isSaved ? lead.name : lead.phone}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  {lead.isSaved ? (
                    <span className="text-lg font-semibold text-foreground">
                      {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                statusColors[lead.status]
              )} />
            </div>

            {/* Content */}
            <div 
              className="flex-1 min-w-0"
              onClick={() => onSelectLead(lead.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {lead.isPinned && (
                    <Pin className="w-3 h-3 text-primary" />
                  )}
                  <span className="font-semibold text-foreground truncate">
                    {lead.isSaved ? lead.name : lead.phone}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{lead.lastMessageTime}</span>
              </div>
              
              {/* Phone number below name when saved */}
              {lead.isSaved && (
                <p className="text-xs text-muted-foreground mb-1">{lead.phone}</p>
              )}
              
              <p className="text-sm text-muted-foreground truncate">{lead.lastMessage}</p>
              
              {/* Labels */}
              {lead.labels.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {lead.labels.map((label) => (
                    <span
                      key={label.id}
                      className="px-2 py-0.5 text-[10px] font-medium rounded-full text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pin button & Unread badge */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                  lead.isPinned && "opacity-100 text-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!lead.isPinned && pinnedCount >= 5) {
                    return; // Max 5 pinned
                  }
                  onTogglePin(lead.id);
                }}
                disabled={!lead.isPinned && pinnedCount >= 5}
                title={lead.isPinned ? "Desafixar" : pinnedCount >= 5 ? "Máximo de 5 fixados" : "Fixar"}
              >
                {lead.isPinned ? (
                  <PinOff className="w-3.5 h-3.5" />
                ) : (
                  <Pin className="w-3.5 h-3.5" />
                )}
              </Button>
              
              {lead.unreadCount > 0 && (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-[10px] font-bold text-accent-foreground">{lead.unreadCount}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
