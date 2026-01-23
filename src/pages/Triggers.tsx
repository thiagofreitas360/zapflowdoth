import { Tag, Link, MessageSquare, UserCheck, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const triggers = [
  {
    id: "1",
    name: "Clicou no link",
    description: "Dispara quando o lead clica em qualquer link enviado",
    icon: Link,
    action: "Enviar Funil: Follow-up",
    active: true,
  },
  {
    id: "2",
    name: "Respondeu mensagem",
    description: "Ativado quando o lead responde qualquer mensagem",
    icon: MessageSquare,
    action: "Marcar como: Lead Quente",
    active: true,
  },
  {
    id: "3",
    name: "Salvou contato",
    description: "Detecta quando o lead salva seu número",
    icon: UserCheck,
    action: "Enviar Funil: Boas-vindas VIP",
    active: false,
  },
];

export default function Triggers() {
  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gatilhos e Automações</h1>
          <p className="text-muted-foreground">Configure ações automáticas baseadas no comportamento dos leads</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Gatilho
        </Button>
      </div>

      {/* Triggers List */}
      <div className="space-y-4 max-w-3xl">
        {triggers.map((trigger, index) => (
          <Card
            key={trigger.id}
            className="p-5 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <trigger.icon className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg">{trigger.name}</h3>
                  <span className={`status-badge ${trigger.active ? 'status-sent' : 'status-pending'}`}>
                    {trigger.active ? 'Ativo' : 'Pausado'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{trigger.description}</p>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Ação:</span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary">
                    <ArrowRight className="w-3 h-3 text-accent" />
                    <span className="font-medium">{trigger.action}</span>
                  </div>
                </div>
              </div>

              <Switch checked={trigger.active} className="flex-shrink-0" />
            </div>
          </Card>
        ))}

        {/* Add New Trigger */}
        <Card className="p-5 border-dashed cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Criar novo gatilho</h3>
              <p className="text-sm text-muted-foreground">Configure uma nova automação</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}