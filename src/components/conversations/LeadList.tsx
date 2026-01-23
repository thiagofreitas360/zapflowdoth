import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Lead } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface LeadListProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
}

const statusColors = {
  hot: "bg-destructive",
  warm: "bg-warning",
  cold: "bg-muted-foreground",
};

export function LeadList({ leads, selectedLeadId, onSelectLead }: LeadListProps) {
  return (
    <div className="h-full flex flex-col border-r border-border bg-card">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Leads */}
      <div className="flex-1 overflow-y-auto">
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead.id)}
            className={cn(
              "flex items-start gap-3 p-4 cursor-pointer transition-all duration-200 border-b border-border/50",
              "hover:bg-secondary/50",
              selectedLeadId === lead.id && "bg-primary/10 border-l-2 border-l-primary",
              index === 0 && "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                statusColors[lead.status]
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground truncate">{lead.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{lead.lastMessageTime}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{lead.lastMessage}</p>
              {/* Tags */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {lead.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/20 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Unread badge */}
            {lead.unreadCount > 0 && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent-foreground">{lead.unreadCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}