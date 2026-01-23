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

export interface Funnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  color: string;
  conversions: number;
  totalSent: number;
}

export interface FunnelStep {
  id: string;
  type: "text" | "audio" | "image" | "document" | "delay";
  content: string;
  delay?: number; // in minutes
}

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
    steps: [
      { id: "s1", type: "text", content: "Olá! Bem-vindo(a) ao ZapFlow! 🚀" },
      { id: "s2", type: "delay", content: "Aguardar", delay: 5 },
      { id: "s3", type: "text", content: "Posso te ajudar com algo?" },
    ],
  },
  {
    id: "f2",
    name: "Retenção",
    description: "Recuperar leads inativos",
    color: "#00B37E",
    conversions: 42,
    totalSent: 120,
    steps: [
      { id: "s4", type: "text", content: "Oi! Sumiu? 👀" },
      { id: "s5", type: "delay", content: "Aguardar", delay: 10 },
      { id: "s6", type: "audio", content: "audio_retencao.ogg" },
    ],
  },
  {
    id: "f3",
    name: "Fechamento",
    description: "Converter leads quentes",
    color: "#F59E0B",
    conversions: 78,
    totalSent: 95,
    steps: [
      { id: "s7", type: "text", content: "Última chance! Oferta expira em 24h ⏰" },
      { id: "s8", type: "document", content: "proposta_comercial.pdf" },
    ],
  },
];