import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { ShieldCheck } from 'lucide-react';

const OPERATOR_LABELS: Record<string, string> = {
  equals: 'Igual',
  not_equals: 'Diferente',
  contains: 'Contém',
  not_contains: 'Não Contém',
};

export function ConditionNode({ id, data, selected }: NodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const d = data as any;
  const matchType = d.matchType || 'any';
  const conditions = d.conditions || [];

  return (
    <BaseNode
      type="condition"
      label="Condição"
      selected={selected}
      hasSecondaryOutput
      secondaryOutputLabel="Não atendida"
      onDelete={() => deleteElements({ nodes: [{ id }] })}
      onDuplicate={() => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: `${id}-copy-${Date.now()}`,
            type: 'condition',
            position: { x: (nodes.find(n => n.id === id)?.position.x || 0) + 40, y: (nodes.find(n => n.id === id)?.position.y || 0) + 40 },
            data: { ...JSON.parse(JSON.stringify(data)) },
          },
        ]);
      }}
    >
      <div className="space-y-1.5">
        <p className="text-foreground font-medium text-xs">
          Pelo menos {matchType === 'all' ? 'TODAS' : 'uma'} das condições é verdadeira
        </p>
        {conditions.length > 0 ? (
          <div className="space-y-1">
            {conditions.map((c: any, i: number) => (
              <div key={i} className="flex flex-wrap items-center gap-1">
                <span className="text-[10px]">{c.source === 'chat_message' ? 'Msg' : 'Var'}</span>
                <span className="px-1 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">
                  {OPERATOR_LABELS[c.operator] || c.operator}
                </span>
                <span className="text-[10px] font-mono truncate max-w-[120px]">{c.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] italic">Nenhuma condição configurada</p>
        )}
        <p className="text-[10px] text-destructive flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
          Condições não foram cumpridas
        </p>
      </div>
    </BaseNode>
  );
}
