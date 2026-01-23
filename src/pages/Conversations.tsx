import { useState } from "react";
import { LeadList } from "@/components/conversations/LeadList";
import { ChatArea } from "@/components/conversations/ChatArea";
import { leads, messages, funnels, Message } from "@/data/mockData";

export default function Conversations() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || null;
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

  return (
    <div className="h-screen flex">
      <div className="w-[360px] flex-shrink-0">
        <LeadList
          leads={leads}
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
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