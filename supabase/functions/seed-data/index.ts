import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id

    // Check if user already has data
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existingLeads && existingLeads.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Dados já existem para este usuário' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create labels
    const labelsData = [
      { user_id: userId, name: 'Cliente VIP', color: '#10B981' },
      { user_id: userId, name: 'Interessado', color: '#F59E0B' },
      { user_id: userId, name: 'Novo Lead', color: '#3B82F6' },
      { user_id: userId, name: 'Aguardando', color: '#8B5CF6' },
    ]
    
    const { data: labels, error: labelsError } = await supabase
      .from('lead_labels')
      .insert(labelsData)
      .select()

    if (labelsError) throw labelsError

    // Create leads
    const leadsData = [
      {
        user_id: userId,
        phone: '+55 11 99999-1234',
        name: 'Maria Silva',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        last_message: 'Olá! Gostaria de saber mais sobre o produto.',
        last_message_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        unread_count: 2,
        status: 'hot',
        is_pinned: true,
        arrival_source: 'meta_ads',
        has_purchased: false,
      },
      {
        user_id: userId,
        phone: '+55 11 98888-5678',
        name: 'João Santos',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
        last_message: 'Qual o prazo de entrega?',
        last_message_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        unread_count: 1,
        status: 'warm',
        is_pinned: false,
        arrival_source: 'organic',
        has_purchased: false,
      },
      {
        user_id: userId,
        phone: '+55 21 97777-9012',
        name: 'Ana Costa',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        last_message: 'Obrigada pela informação!',
        last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        unread_count: 0,
        status: 'warm',
        is_pinned: false,
        arrival_source: 'meta_ads',
        has_purchased: true,
      },
      {
        user_id: userId,
        phone: '+55 31 96666-3456',
        name: 'Pedro Lima',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
        last_message: 'Vou pensar e retorno.',
        last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        unread_count: 0,
        status: 'cold',
        is_pinned: false,
        arrival_source: 'referral',
        has_purchased: false,
      },
      {
        user_id: userId,
        phone: '+55 41 95555-7890',
        name: 'Carla Mendes',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla',
        last_message: 'Perfeito! Vou fazer o pedido.',
        last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        unread_count: 0,
        status: 'hot',
        is_pinned: true,
        arrival_source: 'meta_ads',
        has_purchased: true,
      },
    ]

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsData)
      .select()

    if (leadsError) throw leadsError

    // Create messages for each lead
    const messagesData = []
    for (const lead of leads) {
      messagesData.push(
        {
          lead_id: lead.id,
          content: 'Olá! Vi seu anúncio no Instagram. Pode me dar mais informações?',
          type: 'text',
          direction: 'received',
          status: 'read',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          lead_id: lead.id,
          content: 'Claro! Temos várias opções disponíveis. Qual produto te interessou?',
          type: 'text',
          direction: 'sent',
          status: 'delivered',
          timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        },
        {
          lead_id: lead.id,
          content: lead.last_message || 'Obrigado!',
          type: 'text',
          direction: 'received',
          status: 'read',
          timestamp: lead.last_message_time,
        }
      )
    }

    const { error: messagesError } = await supabase
      .from('messages')
      .insert(messagesData)

    if (messagesError) throw messagesError

    // Assign labels to some leads
    if (labels && leads) {
      const junctionData = [
        { lead_id: leads[0].id, label_id: labels[0].id },
        { lead_id: leads[0].id, label_id: labels[1].id },
        { lead_id: leads[2].id, label_id: labels[0].id },
        { lead_id: leads[4].id, label_id: labels[0].id },
        { lead_id: leads[1].id, label_id: labels[2].id },
        { lead_id: leads[3].id, label_id: labels[3].id },
      ]

      const { error: junctionError } = await supabase
        .from('lead_label_junction')
        .insert(junctionData)

      if (junctionError) throw junctionError
    }

    // Create funnels
    const funnelsData = [
      {
        user_id: userId,
        name: 'Boas-vindas',
        description: 'Sequência de boas-vindas para novos leads',
        color: '#10B981',
        is_favorite: true,
        order_position: 0,
        conversions: 15,
        total_sent: 45,
        total_duration_seconds: 3600,
      },
      {
        user_id: userId,
        name: 'Recuperação de Carrinho',
        description: 'Recuperar leads que abandonaram o carrinho',
        color: '#F59E0B',
        is_favorite: true,
        order_position: 1,
        conversions: 8,
        total_sent: 32,
        total_duration_seconds: 7200,
      },
      {
        user_id: userId,
        name: 'Promoção Semanal',
        description: 'Ofertas especiais toda semana',
        color: '#3B82F6',
        is_favorite: false,
        order_position: 2,
        conversions: 22,
        total_sent: 120,
        total_duration_seconds: 1800,
      },
    ]

    const { data: funnels, error: funnelsError } = await supabase
      .from('funnels')
      .insert(funnelsData)
      .select()

    if (funnelsError) throw funnelsError

    // Create funnel steps
    const stepsData = []
    for (const funnel of funnels) {
      if (funnel.name === 'Boas-vindas') {
        stepsData.push(
          {
            funnel_id: funnel.id,
            type: 'text',
            content: 'Olá! 👋 Seja bem-vindo(a)! Estamos muito felizes em ter você por aqui.',
            delay_minutes: 0,
            show_typing: true,
            order_position: 0,
          },
          {
            funnel_id: funnel.id,
            type: 'delay',
            content: '',
            delay_minutes: 2,
            show_typing: false,
            order_position: 1,
          },
          {
            funnel_id: funnel.id,
            type: 'text',
            content: 'Temos produtos incríveis esperando por você! Quer conhecer nossas ofertas especiais?',
            delay_minutes: 0,
            show_typing: true,
            order_position: 2,
          },
          {
            funnel_id: funnel.id,
            type: 'question',
            content: 'Como posso te ajudar hoje?',
            delay_minutes: 1,
            show_typing: true,
            order_position: 3,
            question_settings: {
              enabled: true,
              questionText: 'Como posso te ajudar hoje?',
              waitMinutes: 5,
              autoResponseText: 'Sem problemas! Estou aqui quando precisar.',
            },
          }
        )
      } else if (funnel.name === 'Recuperação de Carrinho') {
        stepsData.push(
          {
            funnel_id: funnel.id,
            type: 'text',
            content: 'Ei! 🛒 Notamos que você deixou alguns itens no carrinho...',
            delay_minutes: 0,
            show_typing: true,
            order_position: 0,
          },
          {
            funnel_id: funnel.id,
            type: 'delay',
            content: '',
            delay_minutes: 30,
            show_typing: false,
            order_position: 1,
          },
          {
            funnel_id: funnel.id,
            type: 'text',
            content: 'Temos um cupom especial de 10% OFF para você finalizar sua compra! Use: VOLTA10',
            delay_minutes: 0,
            show_typing: true,
            order_position: 2,
          }
        )
      } else {
        stepsData.push(
          {
            funnel_id: funnel.id,
            type: 'text',
            content: '🔥 PROMOÇÃO DA SEMANA! Produtos com até 40% de desconto!',
            delay_minutes: 0,
            show_typing: true,
            order_position: 0,
          },
          {
            funnel_id: funnel.id,
            type: 'image',
            content: 'Confira nossa seleção especial!',
            delay_minutes: 1,
            show_typing: false,
            order_position: 1,
            file_url: 'https://picsum.photos/400/300',
            file_name: 'promocao.jpg',
          }
        )
      }
    }

    const { error: stepsError } = await supabase
      .from('funnel_steps')
      .insert(stepsData)

    if (stepsError) throw stepsError

    // Create triggers
    const triggersData = [
      {
        user_id: userId,
        name: 'Novo Lead do Instagram',
        description: 'Inicia funil de boas-vindas quando um lead chega via Instagram',
        icon: 'Instagram',
        action: funnels[0].id,
        is_active: true,
      },
      {
        user_id: userId,
        name: 'Carrinho Abandonado',
        description: 'Dispara após 1 hora sem finalizar compra',
        icon: 'ShoppingCart',
        action: funnels[1].id,
        is_active: true,
      },
      {
        user_id: userId,
        name: 'Promoção Automática',
        description: 'Envia promoção toda segunda-feira',
        icon: 'Calendar',
        action: funnels[2].id,
        is_active: false,
      },
    ]

    const { error: triggersError } = await supabase
      .from('triggers')
      .insert(triggersData)

    if (triggersError) throw triggersError

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Dados de exemplo criados com sucesso!',
      counts: {
        leads: leads.length,
        labels: labels?.length || 0,
        funnels: funnels.length,
        triggers: triggersData.length,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error seeding data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
