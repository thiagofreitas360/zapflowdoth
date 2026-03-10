import { useState } from 'react';
import { Node, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NODE_COLORS, FlowNodeType } from './types';

interface NodeEditorProps {
  node: Node | null;
  onClose: () => void;
}

export function NodeEditor({ node, onClose }: NodeEditorProps) {
  const { setNodes } = useReactFlow();

  if (!node) return null;

  const updateData = (updates: Record<string, any>) => {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, ...updates } } : n
      )
    );
  };

  const color = NODE_COLORS[node.type as FlowNodeType] || '#6366f1';
  const d = node.data as any;

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border" style={{ borderBottomColor: color }}>
        <h3 className="font-semibold text-foreground capitalize">
          {node.type === 'trigger' ? 'WhatsApp' : node.type === 'content' ? 'Conteúdo' : node.type === 'question' ? 'Pergunta' : node.type === 'gpt' ? 'GPT' : node.type === 'condition' ? 'Condição' : node.type === 'action' ? 'Ação' : node.type === 'delay' ? 'Delay' : 'Menu'}
        </h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {node.type === 'trigger' && <TriggerEditor data={d} onChange={updateData} />}
        {node.type === 'content' && <ContentEditor data={d} onChange={updateData} />}
        {node.type === 'question' && <QuestionEditor data={d} onChange={updateData} />}
        {node.type === 'delay' && <DelayEditor data={d} onChange={updateData} />}
        {node.type === 'action' && <ActionEditor data={d} onChange={updateData} />}
        {node.type === 'condition' && <ConditionEditor data={d} onChange={updateData} />}
        {node.type === 'gpt' && <GptEditor data={d} onChange={updateData} />}
        {node.type === 'menu' && <MenuEditor data={d} onChange={updateData} />}
      </div>
    </div>
  );
}

function TriggerEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Palavra-chave de disparo</Label>
        <Input value={data.keyword || ''} onChange={(e) => onChange({ keyword: e.target.value })} placeholder="Ex: oi, olá, começar" />
      </div>
      <div className="space-y-2">
        <Label>Mensagem de preview</Label>
        <Textarea value={data.previewMessage || ''} onChange={(e) => onChange({ previewMessage: e.target.value })} placeholder="Mensagem exibida no card..." rows={3} />
      </div>
    </>
  );
}

function ContentEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Tipo de conteúdo</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['text', 'image', 'audio', 'video', 'document'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ contentType: t })}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                data.contentType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
              }`}
            >
              {t === 'text' ? 'Texto' : t === 'image' ? 'Imagem' : t === 'audio' ? 'Áudio' : t === 'video' ? 'Vídeo' : 'Documento'}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <Textarea value={data.text || ''} onChange={(e) => onChange({ text: e.target.value })} placeholder="Digite o texto da mensagem..." rows={4} />
      </div>
    </>
  );
}

function QuestionEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  return (
    <>
      <p className="text-xs text-muted-foreground">
        A pergunta será enviada ao contato e o fluxo ficará pausado até que o contato responda ou o bloco expire.
      </p>
      <div className="space-y-2">
        <Label>Faça uma pergunta ao usuário</Label>
        <Textarea value={data.questionText || ''} onChange={(e) => onChange({ questionText: e.target.value })} placeholder="Ex: Olá, qual é o seu nome?" rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Salvar resposta em variável</Label>
        <div className="flex gap-2">
          <Input value={data.variableName || ''} onChange={(e) => onChange({ variableName: e.target.value })} placeholder="nome" className="font-mono" />
          <Select value={data.variableType || 'text'} onValueChange={(v) => onChange({ variableType: v })}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="number">Número</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Telefone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mensagem de erro</Label>
        <Input value={data.errorMessage || ''} onChange={(e) => onChange({ errorMessage: e.target.value })} placeholder="Mensagem inválida, tente novamente!" />
      </div>
      <div className="space-y-2">
        <Label>Expiração (minutos)</Label>
        <Input type="number" value={data.expirationMinutes || 5} onChange={(e) => onChange({ expirationMinutes: parseInt(e.target.value) || 5 })} />
        <p className="text-xs text-destructive">Se não responder em {data.expirationMinutes || 5}m</p>
      </div>
    </>
  );
}

function DelayEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  const seconds = data.delaySeconds || 30;
  return (
    <>
      <div className="space-y-2">
        <Label>Delay ({seconds < 60 ? `${seconds} segundos` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`})</Label>
        <Slider
          value={[seconds]}
          onValueChange={([v]) => onChange({ delaySeconds: v })}
          min={1}
          max={3600}
          step={1}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1s</span>
          <span>1h</span>
        </div>
      </div>
    </>
  );
}

function ActionEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  const actions = [
    { value: 'add_label', label: 'Adicionar Etiqueta' },
    { value: 'remove_label', label: 'Remover Etiqueta' },
    { value: 'start_flow', label: 'Iniciar Fluxo' },
    { value: 'end_flow', label: 'Finalizar Fluxo' },
    { value: 'close_chat', label: 'Finalizar Conversa' },
    { value: 'open_chat', label: 'Abrir Conversa' },
    { value: 'update_contact', label: 'Atualizar contato' },
  ];

  return (
    <>
      <div className="space-y-2">
        <Label>Tipo de ação</Label>
        <div className="space-y-1">
          {actions.map((a) => (
            <button
              key={a.value}
              onClick={() => onChange({ actionType: a.value })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                data.actionType === a.value ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      {(data.actionType === 'add_label' || data.actionType === 'remove_label') && (
        <div className="space-y-2">
          <Label>Etiqueta</Label>
          <Input value={data.actionValue || ''} onChange={(e) => onChange({ actionValue: e.target.value })} placeholder="Nome da etiqueta" />
        </div>
      )}
    </>
  );
}

function ConditionEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  const conditions = data.conditions || [];

  const updateCondition = (index: number, updates: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange({ conditions: newConditions });
  };

  const addCondition = () => {
    onChange({ conditions: [...conditions, { operator: 'equals', value: '', source: 'chat_message' }] });
  };

  const removeCondition = (index: number) => {
    onChange({ conditions: conditions.filter((_: any, i: number) => i !== index) });
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Regra lógica</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange({ matchType: 'all' })}
            className={`p-2 rounded-lg border text-xs font-medium ${data.matchType === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
          >
            TODAS
          </button>
          <button
            onClick={() => onChange({ matchType: 'any' })}
            className={`p-2 rounded-lg border text-xs font-medium ${data.matchType === 'any' ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
          >
            QUALQUER
          </button>
        </div>
      </div>

      {conditions.map((c: any, i: number) => (
        <div key={i} className="space-y-2 p-3 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Condição {i + 1}</Label>
            <button onClick={() => removeCondition(i)} className="text-xs text-destructive hover:underline">Remover</button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {(['equals', 'not_equals', 'contains', 'not_contains'] as const).map((op) => (
              <button
                key={op}
                onClick={() => updateCondition(i, { operator: op })}
                className={`px-2 py-1 rounded text-[11px] border ${c.operator === op ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
              >
                {op === 'equals' ? 'Igual' : op === 'not_equals' ? 'Diferente' : op === 'contains' ? 'Contém' : 'Não Contém'}
              </button>
            ))}
          </div>
          <Input
            value={c.value || ''}
            onChange={(e) => updateCondition(i, { value: e.target.value })}
            placeholder="sim|ok|quero|oi"
            className="text-sm"
          />
          <p className="text-[10px] text-primary">Use "|" para separar sinônimos</p>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addCondition} className="w-full">
        + Adicionar condição
      </Button>
    </>
  );
}

function GptEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Prompt a ser executado</Label>
        <Textarea value={data.prompt || ''} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="Ex: Analise o nome do contato e retorne apenas o primeiro nome..." rows={5} />
      </div>
      <div className="space-y-2">
        <Label>Salvar resultado em</Label>
        <Input value={data.saveAs || ''} onChange={(e) => onChange({ saveAs: e.target.value })} placeholder="nome_processado" className="font-mono" />
      </div>
    </>
  );
}

function MenuEditor({ data, onChange }: { data: any; onChange: (u: any) => void }) {
  const options = data.options || [];

  const updateOption = (index: number, updates: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange({ options: newOptions });
  };

  const addOption = () => {
    onChange({ options: [...options, { key: `${options.length + 1}`, label: '' }] });
  };

  const removeOption = (index: number) => {
    onChange({ options: options.filter((_: any, i: number) => i !== index) });
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Texto do menu</Label>
        <Textarea value={data.menuText || ''} onChange={(e) => onChange({ menuText: e.target.value })} placeholder="Escolha uma opção:" rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Opções</Label>
        {options.map((opt: any, i: number) => (
          <div key={i} className="flex gap-2">
            <Input value={opt.key} onChange={(e) => updateOption(i, { key: e.target.value })} className="w-12 text-center font-bold" />
            <Input value={opt.label} onChange={(e) => updateOption(i, { label: e.target.value })} placeholder="Descrição" className="flex-1" />
            <button onClick={() => removeOption(i)} className="text-xs text-destructive px-2">✕</button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addOption} className="w-full">
          + Adicionar opção
        </Button>
      </div>
    </>
  );
}
