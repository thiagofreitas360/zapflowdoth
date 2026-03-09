import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Zap, Tag, Play, Square, MessageCircle, UserCog } from 'lucide-react';

const ACTION_ICONS: Record<string, any> = {
  add_label: Tag,
  remove_label: Tag,
  start_flow: Play,
  end_flow: Square,
  close_chat: MessageCircle,
  open_chat: MessageCircle,
  update_contact: UserCog,
};

const ACTION_LABELS: Record<string, string> = {
  add_label: 'Adicionar Etiqueta',
  remove_label: 'Remover Etiqueta',
  start_flow: 'Iniciar Fluxo',
  end_flow: 'Finalizar Fluxo',
  close_chat: 'Finalizar Conversa',
  open_chat: 'Abrir Conversa',
  update_contact: 'Atualizar contato',
};

export function ActionNode({ id, data, selected }: NodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const d = data as any;
  const actionType = d.actionType || 'end_flow';
  const Icon = ACTION_ICONS[actionType] || Zap;

  return (
    <BaseNode
      type="action"
      label="Ação"
      selected={selected}
      onDelete={() => deleteElements({ nodes: [{ id }] })}
      onDuplicate={() => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: `${id}-copy-${Date.now()}`,
            type: 'action',
            position: { x: (nodes.find(n => n.id === id)?.position.x || 0) + 40, y: (nodes.find(n => n.id === id)?.position.y || 0) + 40 },
            data: { ...data },
          },
        ]);
      }}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <div>
          <p className="font-medium text-foreground text-xs">{ACTION_LABELS[actionType]}</p>
          {d.actionValue && (
            <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
              {d.actionValue}
            </span>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
