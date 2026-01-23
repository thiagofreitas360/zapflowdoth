// Database types matching Supabase schema
export type LeadStatus = 'hot' | 'warm' | 'cold';
export type ArrivalSource = 'meta_ads' | 'organic' | 'referral';
export type MessageType = 'text' | 'audio' | 'image' | 'document';
export type MessageDirection = 'sent' | 'received';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type StepType = 'text' | 'audio' | 'image' | 'document' | 'delay' | 'question';

export interface Lead {
  id: string;
  user_id: string;
  phone: string;
  name: string | null;
  avatar_url: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  status: LeadStatus;
  is_saved: boolean;
  is_pinned: boolean;
  arrival_date: string;
  arrival_source: ArrivalSource;
  has_purchased: boolean;
  created_at: string;
  updated_at: string;
  labels?: LeadLabel[];
}

export interface LeadLabel {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface LeadLabelJunction {
  id: string;
  lead_id: string;
  label_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  lead_id: string;
  content: string;
  type: MessageType;
  direction: MessageDirection;
  timestamp: string;
  status: MessageStatus;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

export interface Funnel {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  is_favorite: boolean;
  order_position: number;
  conversions: number;
  total_sent: number;
  total_duration_seconds: number;
  created_at: string;
  updated_at: string;
  steps?: FunnelStep[];
}

export interface QuestionSettings {
  enabled: boolean;
  questionText: string;
  waitMinutes: number;
  autoResponseText: string;
}

export interface FunnelStep {
  id: string;
  funnel_id: string;
  type: StepType;
  content: string;
  delay_minutes: number;
  show_typing: boolean;
  order_position: number;
  file_url: string | null;
  file_name: string | null;
  question_settings: QuestionSettings | null;
  created_at: string;
  updated_at: string;
}

export interface Trigger {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string;
  action: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  profile_name: string | null;
  email: string | null;
  meta_api_key: string | null;
  phone_id: string | null;
  notify_new_messages: boolean;
  notify_conversions: boolean;
  notify_weekly_report: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActiveFunnel {
  id: string;
  user_id: string;
  lead_id: string;
  funnel_id: string;
  current_step_index: number;
  remaining_seconds: number;
  start_time: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
