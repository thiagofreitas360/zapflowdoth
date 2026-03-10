import { Handle, Position } from '@xyflow/react';
import { Copy, Trash2 } from 'lucide-react';
import { NODE_COLORS, FlowNodeType } from '../types';

interface BaseNodeProps {
  type: FlowNodeType;
  label: string;
  children: React.ReactNode;
  selected?: boolean;
  hasInput?: boolean;
  hasOutput?: boolean;
  hasSecondaryOutput?: boolean;
  secondaryOutputLabel?: string;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export function BaseNode({
  type,
  label,
  children,
  selected,
  hasInput = true,
  hasOutput = true,
  hasSecondaryOutput = false,
  secondaryOutputLabel,
  onDelete,
  onDuplicate,
}: BaseNodeProps) {
  const color = NODE_COLORS[type];

  return (
    <div
      className={`min-w-[220px] max-w-[280px] rounded-xl bg-card border-2 shadow-lg transition-shadow ${
        selected ? 'shadow-xl ring-2 ring-primary/50' : ''
      }`}
      style={{ borderColor: selected ? color : `${color}40` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-[10px] text-white text-sm font-semibold"
        style={{ backgroundColor: color }}
      >
        <span className="truncate">{label}</span>
        <div className="flex items-center gap-1 ml-2">
          {onDuplicate && (
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-0.5 rounded hover:bg-white/20 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-0.5 rounded hover:bg-white/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 text-xs text-muted-foreground">{children}</div>

      {/* Handles */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !border-2 !border-white !bg-muted-foreground"
        />
      )}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !border-2 !border-white"
          style={{ backgroundColor: color }}
        />
      )}
      {hasSecondaryOutput && (
        <Handle
          type="source"
          position={Position.Right}
          id="secondary"
          className="!w-3 !h-3 !border-2 !border-white !bg-destructive"
          style={{ top: '75%' }}
        />
      )}
    </div>
  );
}
