export interface LeadLabel {
  id: string;
  name: string;
  color: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "hot" | "warm" | "cold";
  tags: string[];
  isSaved: boolean;
  isPinned: boolean;
  labels: LeadLabel[];
  arrivalDate: string;
  arrivalSource?: "meta_ads" | "organic" | "referral";
  hasPurchased: boolean;
}

export interface Message {
  id: string;
  leadId: string;
  content: string;
  type: "text" | "audio" | "image" | "document";
  direction: "sent" | "received";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

export interface FunnelQuestion {
  enabled: boolean;
  questionText: string;
  waitMinutes: number;
  autoResponseText: string;
}

export interface FunnelStep {
  id: string;
  type: "text" | "audio" | "image" | "document" | "delay" | "question";
  content: string;
  delay?: number;
  showTypingIndicator?: boolean;
  question?: FunnelQuestion;
}

export interface Funnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  color: string;
  conversions: number;
  totalSent: number;
  totalDurationSeconds: number;
}

export interface ActiveFunnel {
  funnelId: string;
  leadId: string;
  startTime: number;
  remainingSeconds: number;
  currentStep: number;
}

export const defaultLabels: LeadLabel[] = [
  { id: "l1", name: "Comprou", color: "#00B37E" },
  { id: "l2", name: "Pendente", color: "#F59E0B" },
  { id: "l3", name: "Perdido", color: "#EF4444" },
  { id: "l4", name: "Novo", color: "#3B82F6" },
  { id: "l5", name: "VIP", color: "#8B5CF6" },
];

export const leads: Lead[] = [
  {
    id: "1",
    name: "Marina Silva",
    phone: "+55 11 99999-1234",
    lastMessage: "Oi, quero saber mais sobre o curso!",
    lastMessageTime: "14:32",
    unreadCount: 2,
    status: "hot",
    tags: ["Interessado", "Curso Premium"],
    isSaved: true,
    isPinned: true,
    labels: [{ id: "l4", name: "Novo", color: "#3B82F6" }],
    arrivalDate: "2025-01-23",
    arrivalSource: "meta_ads",
    hasPurchased: false,
  },
  {
    id: "2",
    name: "Carlos Eduardo",
    phone: "+55 21 98888-5678",
    lastMessage: "Pode me enviar o PDF?",
    lastMessageTime: "13:15",
    unreadCount: 0,
    status: "warm",
    tags: ["Material Enviado"],
    isSaved: false,
    isPinned: false,
    labels: [],
    arrivalDate: "2025-01-22",
    arrivalSource: "meta_ads",
    hasPurchased: false,
  },
  {
    id: "3",
    name: "Ana Beatriz",
    phone: "+55 31 97777-9012",
    lastMessage: "Obrigada pelas informações!",
    lastMessageTime: "12:45",
    unreadCount: 0,
    status: "warm",
    tags: ["Follow-up"],
    isSaved: true,
    isPinned: false,
    labels: [{ id: "l1", name: "Comprou", color: "#00B37E" }],
    arrivalDate: "2025-01-20",
    arrivalSource: "organic",
    hasPurchased: true,
  },
  {
    id: "4",
    name: "Pedro Henrique",
    phone: "+55 41 96666-3456",
    lastMessage: "Vou pensar e te aviso",
    lastMessageTime: "Ontem",
    unreadCount: 0,
    status: "cold",
    tags: ["Retenção"],
    isSaved: false,
    isPinned: false,
    labels: [{ id: "l2", name: "Pendente", color: "#F59E0B" }],
    arrivalDate: "2025-01-15",
    arrivalSource: "meta_ads",
    hasPurchased: false,
  },
  {
    id: "5",
    name: "Juliana Costa",
    phone: "+55 51 95555-7890",
    lastMessage: "Qual o valor com desconto?",
    lastMessageTime: "Ontem",
    unreadCount: 1,
    status: "hot",
    tags: ["Negociação", "Desconto"],
    isSaved: true,
    isPinned: true,
    labels: [{ id: "l5", name: "VIP", color: "#8B5CF6" }],
    arrivalDate: "2025-01-23",
    arrivalSource: "referral",
    hasPurchased: false,
  },
  {
    id: "6",
    name: "Roberto Almeida",
    phone: "+55 61 94444-1111",
    lastMessage: "Fechado! Vou comprar",
    lastMessageTime: "10:20",
    unreadCount: 0,
    status: "hot",
    tags: ["Fechamento"],
    isSaved: true,
    isPinned: false,
    labels: [{ id: "l1", name: "Comprou", color: "#00B37E" }],
    arrivalDate: "2025-01-21",
    arrivalSource: "meta_ads",
    hasPurchased: true,
  },
];

export const messages: Message[] = [
  {
    id: "m1",
    leadId: "1",
    content: "Olá Marina! Tudo bem? 😊",
    type: "text",
    direction: "sent",
    timestamp: "14:20",
    status: "read",
  },
  {
    id: "m2",
    leadId: "1",
    content: "Oi! Tudo sim, e você?",
    type: "text",
    direction: "received",
    timestamp: "14:25",
  },
  {
    id: "m3",
    leadId: "1",
    content: "Vi que você se interessou pelo nosso curso de marketing digital. Posso te contar mais?",
    type: "text",
    direction: "sent",
    timestamp: "14:28",
    status: "read",
  },
  {
    id: "m4",
    leadId: "1",
    content: "Oi, quero saber mais sobre o curso!",
    type: "text",
    direction: "received",
    timestamp: "14:32",
  },
];

export const funnels: Funnel[] = [
  {
    id: "f1",
    name: "Boas-vindas",
    description: "Sequência inicial para novos leads",
    color: "#6E56CF",
    conversions: 145,
    totalSent: 280,
    totalDurationSeconds: 65,
    steps: [
      { id: "s1", type: "text", content: "Olá! Bem-vindo(a) ao ZapFlow! 🚀", showTypingIndicator: true },
      { id: "s2", type: "delay", content: "Aguardar", delay: 5, showTypingIndicator: true },
      { id: "s3", type: "text", content: "Posso te ajudar com algo?", showTypingIndicator: false },
    ],
  },
  {
    id: "f2",
    name: "Retenção",
    description: "Recuperar leads inativos",
    color: "#00B37E",
    conversions: 42,
    totalSent: 120,
    totalDurationSeconds: 120,
    steps: [
      { id: "s4", type: "text", content: "Oi! Sumiu? 👀", showTypingIndicator: true },
      { id: "s5", type: "delay", content: "Aguardar", delay: 10, showTypingIndicator: false },
      { id: "s6", type: "audio", content: "audio_retencao.ogg", showTypingIndicator: false },
    ],
  },
  {
    id: "f3",
    name: "Fechamento",
    description: "Converter leads quentes",
    color: "#F59E0B",
    conversions: 78,
    totalSent: 95,
    totalDurationSeconds: 30,
    steps: [
      { id: "s7", type: "text", content: "Última chance! Oferta expira em 24h ⏰", showTypingIndicator: true },
      { id: "s8", type: "document", content: "proposta_comercial.pdf", showTypingIndicator: false },
    ],
  },
  {
    id: "f4",
    name: "Follow-up Automático",
    description: "Seguimento com pergunta",
    color: "#EC4899",
    conversions: 32,
    totalSent: 85,
    totalDurationSeconds: 180,
    steps: [
      { id: "s9", type: "text", content: "E aí, conseguiu ver o material?", showTypingIndicator: true },
      { 
        id: "s10", 
        type: "question", 
        content: "Ficou alguma dúvida?",
        question: {
          enabled: true,
          questionText: "Ficou alguma dúvida?",
          waitMinutes: 5,
          autoResponseText: "Sem problemas! Fico à disposição quando precisar 😊"
        }
      },
    ],
  },
  {
    id: "f5",
    name: "Oferta Especial",
    description: "Promoção limitada",
    color: "#06B6D4",
    conversions: 55,
    totalSent: 110,
    totalDurationSeconds: 45,
    steps: [
      { id: "s11", type: "text", content: "🔥 OFERTA EXCLUSIVA só pra você!", showTypingIndicator: true },
      { id: "s12", type: "delay", content: "Aguardar", delay: 3, showTypingIndicator: true },
      { id: "s13", type: "text", content: "50% de desconto nas próximas 2 horas!", showTypingIndicator: false },
    ],
  },
];
