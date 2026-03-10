import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { HelpCircle } from 'lucide-react';

export function QuestionNode({ id, data, selected }: NodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const d = data as any;

  return (
    <BaseNode
      type="question"
      label="Pergunta"
      selected={selected}
      hasSecondaryOutput
      secondaryOutputLabel="Timeout"
      onDelete={() => deleteElements({ nodes: [{ id }] })}
      onDuplicate={() => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: `${id}-copy-${Date.now()}`,
            type: 'question',
            position: { x: (nodes.find(n => n.id === id)?.position.x || 0) + 40, y: (nodes.find(n => n.id === id)?.position.y || 0) + 40 },
            data: { ...data },
          },
        ]);
      }}
    >
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-foreground font-medium text-xs leading-snug">
            {d.questionText || 'Faça uma pergunta ao usuário'}
          </p>
        </div>
        {d.variableName && (
          <div className="flex items-center gap-1">
            <span className="text-[10px]">Salvar em:</span>
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-mono">
              {`{{${d.variableName}}}`}
            </span>
          </div>
        )}
        {d.expirationMinutes && (
          <p className="text-[10px] text-destructive flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
            Se não responder em {d.expirationMinutes}m
          </p>
        )}
      </div>
    </BaseNode>
  );
}
