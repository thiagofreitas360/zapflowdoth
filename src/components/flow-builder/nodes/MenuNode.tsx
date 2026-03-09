import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { List } from 'lucide-react';

export function MenuNode({ id, data, selected }: NodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const d = data as any;
  const options = d.options || [];

  return (
    <BaseNode
      type="menu"
      label="Menu"
      selected={selected}
      onDelete={() => deleteElements({ nodes: [{ id }] })}
      onDuplicate={() => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: `${id}-copy-${Date.now()}`,
            type: 'menu',
            position: { x: (nodes.find(n => n.id === id)?.position.x || 0) + 40, y: (nodes.find(n => n.id === id)?.position.y || 0) + 40 },
            data: { ...JSON.parse(JSON.stringify(data)) },
          },
        ]);
      }}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-indigo-500" />
          <p className="font-medium text-foreground text-xs">Menu de opções</p>
        </div>
        {d.menuText && (
          <p className="text-[11px] line-clamp-2">{d.menuText}</p>
        )}
        {options.length > 0 && (
          <div className="space-y-0.5">
            {options.map((opt: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                  {opt.key}
                </span>
                <span className="truncate">{opt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseNode>
  );
}
