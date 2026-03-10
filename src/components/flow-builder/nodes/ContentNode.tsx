import { NodeProps, useReactFlow } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { Type, Image, Mic, Video, FileText } from 'lucide-react';

const CONTENT_ICONS = {
  text: Type,
  image: Image,
  audio: Mic,
  video: Video,
  document: FileText,
};

export function ContentNode({ id, data, selected }: NodeProps) {
  const { deleteElements, setNodes } = useReactFlow();
  const d = data as any;
  const contentType = d.contentType || 'text';
  const Icon = CONTENT_ICONS[contentType as keyof typeof CONTENT_ICONS] || Type;

  return (
    <BaseNode
      type="content"
      label="Conteúdo"
      selected={selected}
      onDelete={() => deleteElements({ nodes: [{ id }] })}
      onDuplicate={() => {
        setNodes((nodes) => [
          ...nodes,
          {
            id: `${id}-copy-${Date.now()}`,
            type: 'content',
            position: { x: (nodes.find(n => n.id === id)?.position.x || 0) + 40, y: (nodes.find(n => n.id === id)?.position.y || 0) + 40 },
            data: { ...data },
          },
        ]);
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-purple-500" />
        <span className="capitalize font-medium text-foreground">{contentType === 'text' ? 'Texto' : contentType === 'image' ? 'Imagem' : contentType === 'audio' ? 'Áudio' : contentType === 'video' ? 'Vídeo' : 'Documento'}</span>
      </div>
      {d.text && (
        <p className="line-clamp-3 text-[11px] leading-relaxed">{d.text}</p>
      )}
    </BaseNode>
  );
}
