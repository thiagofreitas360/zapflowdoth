import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Sparkles } from 'lucide-react';

export function GptNode({ id, data, selected }: NodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const d = data as any;

  return (
    <BaseNode
      type="gpt"
      label="GPT"
      selected={selected}
      onDelete={() => deleteElements({ nodes: [{ id }] })}
      onDuplicate={() => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: `${id}-copy-${Date.now()}`,
            type: 'gpt',
            position: { x: (nodes.find(n => n.id === id)?.position.x || 0) + 40, y: (nodes.find(n => n.id === id)?.position.y || 0) + 40 },
            data: { ...data },
          },
        ]);
      }}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <p className="font-medium text-foreground text-xs">Prompt a ser executado</p>
        </div>
        {d.prompt && (
          <p className="line-clamp-3 text-[11px] leading-relaxed bg-muted p-1.5 rounded">{d.prompt}</p>
        )}
        {d.saveAs && (
          <div className="flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px]">
              Salvar: {d.saveAs}
            </span>
          </div>
        )}
        <p className="text-[10px] italic">Erro ao gerar mensagem →</p>
      </div>
    </BaseNode>
  );
}
