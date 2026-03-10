import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Clock } from 'lucide-react';

export function DelayNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const d = data as any;
  const seconds = d.delaySeconds || 30;

  const formatDelay = (s: number) => {
    if (s < 60) return `${s} segundos`;
    if (s < 3600) return `${Math.floor(s / 60)} minutos`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  };

  return (
    <BaseNode
      type="delay"
      label="Delay"
      selected={selected}
      onDelete={() => deleteElements({ nodes: [{ id }] })}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-teal-500" />
        <div>
          <p className="font-medium text-foreground text-xs">
            Aguardar o prazo de {formatDelay(seconds)}
          </p>
          <p className="text-[10px] mt-0.5">Após esse tempo o fluxo prosseguirá.</p>
        </div>
      </div>
    </BaseNode>
  );
}
