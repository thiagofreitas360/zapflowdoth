import { useAuth } from './useAuth';

const META_API_URL = 'https://gfiwcejabijeiaidcdur.supabase.co/functions/v1/meta-api';

export function useMetaApi() {
  const { session } = useAuth();

  const callMetaApi = async (action: string, params: Record<string, unknown> = {}) => {
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(META_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...params }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Meta API request failed');
    }

    return data;
  };

  const sendTextMessage = async (to: string, message: string) => {
    return callMetaApi('send_text', { to, message });
  };

  const sendTemplate = async (to: string, templateName: string, templateParams?: unknown[]) => {
    return callMetaApi('send_template', { 
      to, 
      template_name: templateName, 
      template_params: templateParams 
    });
  };

  const checkStatus = async () => {
    return callMetaApi('check_status');
  };

  return {
    sendTextMessage,
    sendTemplate,
    checkStatus,
    callMetaApi,
  };
}
