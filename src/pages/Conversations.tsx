import { useState } from "react";
import { LeadList } from "@/components/conversations/LeadList";
import { ChatArea } from "@/components/conversations/ChatArea";
import { leads as initialLeads, messages, funnels, Message, Lead } from "@/data/mockData";

export default function Conversations() {
  const [leadsList, setLeadsList] = useState<Lead[]>(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leadsList[0]?.id || null);
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);

  const selectedLead = leadsList.find((l) => l.id === selectedLeadId) || null;
  const leadMessages = chatMessages.filter((m) => m.leadId === selectedLeadId);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      leadId: selectedLeadId!,
      content,
      type: "text",
      direction: "sent",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  const handleTriggerFunnel = (funnelId: string) => {
    const funnel = funnels.find((f) => f.id === funnelId);
    if (funnel && funnel.steps.length > 0) {
      const firstStep = funnel.steps.find((s) => s.type === "text");
      if (firstStep) {
        handleSendMessage(firstStep.content);
      }
    }
  };

  const handleTogglePin = (leadId: string) => {
    setLeadsList((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, isPinned: !lead.isPinned } : lead
      )
    );
  };

  return (
    <div className="h-screen flex">
      <div className="w-[360px] flex-shrink-0">
        <LeadList
          leads={leadsList}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          onTogglePin={handleTogglePin}
        />
      </div>
      <div className="flex-1">
        <ChatArea
          lead={selectedLead}
          messages={leadMessages}
          funnels={funnels}
          onSendMessage={handleSendMessage}
          onTriggerFunnel={handleTriggerFunnel}
        />
      </div>
    </div>
  );
}
