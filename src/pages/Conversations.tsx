import { useState, useEffect } from "react";
import { LeadList } from "@/components/conversations/LeadList";
import { ChatArea } from "@/components/conversations/ChatArea";
import { useLeads, useToggleLeadPin } from "@/hooks/useLeads";
import { useMessages, useCreateMessage } from "@/hooks/useMessages";
import { useFunnels } from "@/hooks/useFunnels";
import { Loader2 } from "lucide-react";

export default function Conversations() {
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: funnels = [] } = useFunnels();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const { data: messages = [] } = useMessages(selectedLeadId);
  const createMessage = useCreateMessage();
  const togglePin = useToggleLeadPin();

  // Select first lead when leads load
  useEffect(() => {
    if (leads.length > 0 && !selectedLeadId) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;

  const handleSendMessage = async (content: string) => {
    if (!selectedLeadId) return;
    
    await createMessage.mutateAsync({
      lead_id: selectedLeadId,
      content,
      direction: 'sent',
      type: 'text',
      status: 'sent',
    });
  };

  const handleTriggerFunnel = (funnelId: string) => {
    const funnel = funnels.find((f) => f.id === funnelId);
    if (funnel && funnel.steps && funnel.steps.length > 0) {
      const firstStep = funnel.steps.find((s) => s.type === "text");
      if (firstStep) {
        handleSendMessage(firstStep.content);
      }
    }
  };

  const handleTogglePin = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      togglePin.mutate({ id: leadId, is_pinned: !lead.is_pinned });
    }
  };

  if (leadsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-[360px] flex-shrink-0 h-full overflow-hidden">
        <LeadList
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          onTogglePin={handleTogglePin}
        />
      </div>
      <div className="flex-1 h-full overflow-hidden">
        <ChatArea
          lead={selectedLead}
          messages={messages}
          funnels={funnels}
          onSendMessage={handleSendMessage}
          onTriggerFunnel={handleTriggerFunnel}
        />
      </div>
    </div>
  );
}
