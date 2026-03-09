export type FlowNodeType = 
  | 'trigger'
  | 'content'
  | 'question'
  | 'delay'
  | 'action'
  | 'condition'
  | 'gpt'
  | 'menu';

export interface TriggerNodeData {
  label: string;
  keyword?: string;
  previewMessage?: string;
}

export interface ContentNodeData {
  label: string;
  contentType: 'text' | 'image' | 'audio' | 'video' | 'document';
  text?: string;
  fileUrl?: string;
}

export interface QuestionNodeData {
  label: string;
  questionText: string;
  variableName?: string;
  variableType?: 'text' | 'number' | 'email' | 'phone';
  errorMessage?: string;
  expirationMinutes?: number;
}

export interface DelayNodeData {
  label: string;
  delaySeconds: number;
}

export interface ActionNodeData {
  label: string;
  actionType: 'add_label' | 'remove_label' | 'start_flow' | 'end_flow' | 'close_chat' | 'open_chat' | 'update_contact';
  actionValue?: string;
}

export interface ConditionNodeData {
  label: string;
  matchType: 'all' | 'any';
  conditions: {
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains';
    value: string;
    source: 'chat_message' | 'variable';
  }[];
}

export interface GptNodeData {
  label: string;
  prompt: string;
  saveAs?: string;
  model?: string;
}

export interface MenuNodeData {
  label: string;
  menuText: string;
  options: { key: string; label: string }[];
}

export type FlowNodeData =
  | TriggerNodeData
  | ContentNodeData
  | QuestionNodeData
  | DelayNodeData
  | ActionNodeData
  | ConditionNodeData
  | GptNodeData
  | MenuNodeData;

export const NODE_COLORS: Record<FlowNodeType, string> = {
  trigger: '#22c55e',
  content: '#7c3aed',
  question: '#f97316',
  delay: '#0d9488',
  action: '#3b82f6',
  condition: '#ef4444',
  gpt: '#8b5cf6',
  menu: '#6366f1',
};

export const NODE_LABELS: Record<FlowNodeType, string> = {
  trigger: 'WhatsApp',
  content: 'Conteúdo',
  question: 'Pergunta',
  delay: 'Delay',
  action: 'Ação',
  condition: 'Condição',
  gpt: 'GPT',
  menu: 'Menu',
};
