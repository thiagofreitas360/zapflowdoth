import { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  Panel,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { NodeMenu } from './NodeMenu';
import { NodeEditor } from './NodeEditor';
import { FlowNodeType, NODE_COLORS } from './types';
import { Plus, ArrowLeft, Save, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DEFAULT_DATA: Record<FlowNodeType, any> = {
  trigger: { keyword: '', previewMessage: '' },
  content: { contentType: 'text', text: '' },
  question: { questionText: '', variableName: '', variableType: 'text', errorMessage: '', expirationMinutes: 5 },
  delay: { delaySeconds: 30 },
  action: { actionType: 'end_flow', actionValue: '' },
  condition: { matchType: 'any', conditions: [] },
  gpt: { prompt: '', saveAs: '' },
  menu: { menuText: '', options: [{ key: '1', label: 'Opção 1' }, { key: '2', label: 'Opção 2' }] },
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 100, y: 300 },
    data: { keyword: 'Disparo: palavra-chave', previewMessage: 'Olá! Tudo bem e quero mais informações, por favor!' },
  },
];

const initialEdges: Edge[] = [];

export function FlowCanvas() {
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const nodeCounter = useRef(10);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: '#6E56CF', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(
    (type: FlowNodeType) => {
      nodeCounter.current += 1;
      const id = `${type}-${nodeCounter.current}`;
      const newNode: Node = {
        id,
        type,
        position: {
          x: 250 + Math.random() * 400,
          y: 150 + Math.random() * 400,
        },
        data: { ...DEFAULT_DATA[type] },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div className="w-full h-screen relative bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6E56CF', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground) / 0.15)" />
        <Controls
          showInteractive={false}
          className="!bg-card !border-border !rounded-xl !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
        <MiniMap
          nodeColor={(n) => NODE_COLORS[n.type as FlowNodeType] || '#6366f1'}
          maskColor="hsl(var(--background) / 0.7)"
          className="!bg-card !border-border !rounded-xl"
        />

        {/* Top bar */}
        <Panel position="top-left" className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/funnels')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Panel>

        <Panel position="top-center">
          <div className="bg-card border border-border rounded-xl px-6 py-2 shadow-lg flex items-center gap-3">
            <span className="font-semibold text-foreground">Flow Builder</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {nodes.length} nós
            </span>
          </div>
        </Panel>

        <Panel position="top-right" className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-xl">
            <Save className="w-4 h-4" />
          </Button>
        </Panel>
      </ReactFlow>

      {/* Add node FAB */}
      <button
        onClick={() => setMenuOpen(true)}
        className="absolute bottom-8 left-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Node menu */}
      <NodeMenu open={menuOpen} onClose={() => setMenuOpen(false)} onAddNode={addNode} />

      {/* Node editor */}
      <NodeEditor
        node={selectedNode ? nodes.find((n) => n.id === selectedNode.id) || null : null}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
