import { TriggerNode } from './TriggerNode';
import { ContentNode } from './ContentNode';
import { QuestionNode } from './QuestionNode';
import { DelayNode } from './DelayNode';
import { ActionNode } from './ActionNode';
import { ConditionNode } from './ConditionNode';
import { GptNode } from './GptNode';
import { MenuNode } from './MenuNode';

export const nodeTypes = {
  trigger: TriggerNode,
  content: ContentNode,
  question: QuestionNode,
  delay: DelayNode,
  action: ActionNode,
  condition: ConditionNode,
  gpt: GptNode,
  menu: MenuNode,
};
