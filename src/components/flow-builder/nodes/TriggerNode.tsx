import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { MessageSquare } from 'lucide-react';

export function TriggerNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();

  return (
    <BaseNode
      type="trigger"
      label="WhatsApp"
      selected={selected}
      hasInput={false}
      onDelete={() => deleteElements({ nodes: [{ id }] })}
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-foreground text-xs">
            {(data as any).keyword || 'Disparo: palavra-chave'}
          </p>
          {(data as any).previewMessage && (
            <div className="mt-1.5 p-1.5 bg-muted rounded text-[10px] leading-tight">
              {(data as any).previewMessage}
            </div>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
