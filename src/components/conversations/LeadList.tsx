import { useState } from "react";
import { Search, Pin, PinOff, User, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Lead } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCreateLead } from "@/hooks/useLeads";

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
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const createLead = useCreateLead();

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.phone.toLowerCase().includes(searchLower) ||
      (lead.is_saved && lead.name?.toLowerCase().includes(searchLower)) ||
      (lead.labels || []).some((l) => l.name.toLowerCase().includes(searchLower))
    );
  });

  // Sort: pinned first, then by last message time
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return 0;
  });

  const pinnedCount = leads.filter((l) => l.is_pinned).length;

  const handleAddLead = async () => {
    if (!newPhone.trim()) return;
    
    await createLead.mutateAsync({
      phone: newPhone.trim(),
      name: newName.trim() || undefined,
    });
    
    setNewPhone("");
    setNewName("");
    setIsAddingLead(false);
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col border-r border-border bg-card overflow-hidden">
      {/* Search Header - Fixed */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por número, nome ou etiqueta..."
              className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
            <DialogTrigger asChild>
              <Button size="icon" className="flex-shrink-0 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="mt-2 bg-secondary border-0"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome (opcional)</Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome do lead"
                    className="mt-2 bg-secondary border-0"
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleAddLead}
                  disabled={!newPhone.trim() || createLead.isPending}
                >
                  Adicionar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Leads - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-muted-foreground mb-2">Nenhum lead encontrado</p>
            <p className="text-sm text-muted-foreground">Clique em + para adicionar um lead</p>
          </div>
        ) : (
          sortedLeads.map((lead, index) => (
            <div
              key={lead.id}
              className={cn(
                "flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-border/50 group",
                "hover:bg-secondary/50",
                selectedLeadId === lead.id && "bg-primary/10 border-l-2 border-l-primary",
                lead.is_pinned && "bg-primary/5",
                index === 0 && "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div 
                className="relative flex-shrink-0"
                onClick={() => onSelectLead(lead.id)}
              >
                {lead.avatar_url ? (
                  <img 
                    src={lead.avatar_url} 
                    alt={lead.is_saved ? lead.name || "" : lead.phone}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    {lead.is_saved && lead.name ? (
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
                    {lead.is_pinned && (
                      <Pin className="w-3 h-3 text-primary" />
                    )}
                    <span className="font-semibold text-foreground truncate">
                      {lead.is_saved && lead.name ? lead.name : lead.phone}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(lead.last_message_time)}
                  </span>
                </div>
                
                {/* Phone number below name when saved */}
                {lead.is_saved && lead.name && (
                  <p className="text-xs text-muted-foreground mb-1">{lead.phone}</p>
                )}
                
                <p className="text-sm text-muted-foreground truncate">
                  {lead.last_message || "Nenhuma mensagem"}
                </p>
                
                {/* Labels */}
                {lead.labels && lead.labels.length > 0 && (
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
                    lead.is_pinned && "opacity-100 text-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!lead.is_pinned && pinnedCount >= 5) {
                      return; // Max 5 pinned
                    }
                    onTogglePin(lead.id);
                  }}
                  disabled={!lead.is_pinned && pinnedCount >= 5}
                  title={lead.is_pinned ? "Desafixar" : pinnedCount >= 5 ? "Máximo de 5 fixados" : "Fixar"}
                >
                  {lead.is_pinned ? (
                    <PinOff className="w-3.5 h-3.5" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                </Button>
                
                {lead.unread_count > 0 && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-[10px] font-bold text-accent-foreground">{lead.unread_count}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
