import { X, MessageSquare, Type, HelpCircle, Zap, Clock, ShieldCheck, Sparkles, List } from 'lucide-react';
import { FlowNodeType, NODE_COLORS } from './types';

interface NodeMenuProps {
  open: boolean;
  onClose: () => void;
  onAddNode: (type: FlowNodeType) => void;
}

const NODE_OPTIONS: { type: FlowNodeType; icon: any; label: string; description: string; popular?: boolean }[] = [
  { type: 'menu', icon: List, label: 'Menu', description: 'Menu de opções' },
  { type: 'content', icon: Type, label: 'Conteúdo', description: 'Enviar mensagem de texto, imagem...', popular: true },
  { type: 'question', icon: HelpCircle, label: 'Pergunta', description: 'Enviar pergunta', popular: true },
  { type: 'action', icon: Zap, label: 'Ação', description: 'Executar uma ação', popular: true },
  { type: 'delay', icon: Clock, label: 'Delay', description: 'Aguardar um período' },
  { type: 'condition', icon: ShieldCheck, label: 'Condição', description: 'Validar uma condição', popular: true },
  { type: 'gpt', icon: Sparkles, label: 'GPT', description: 'Gerador de textos GPT' },
];

export function NodeMenu({ open, onClose, onAddNode }: NodeMenuProps) {
  if (!open) return null;

  return (
    <div className="absolute left-4 top-4 bottom-4 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Menu de opções</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {NODE_OPTIONS.map(({ type, icon: Icon, label, description, popular }) => (
          <button
            key={type}
            onClick={() => { onAddNode(type); onClose(); }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${NODE_COLORS[type]}15`, color: NODE_COLORS[type] }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-foreground">{label}</span>
                {popular && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
