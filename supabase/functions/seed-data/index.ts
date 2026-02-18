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

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id

    // === CLEANUP: delete existing data for this user ===
    // 1. Get lead IDs to clean messages and junctions
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('user_id', userId)

    if (existingLeads && existingLeads.length > 0) {
      const leadIds = existingLeads.map((l: { id: string }) => l.id)

      // Delete active_funnels
      await supabase.from('active_funnels').delete().eq('user_id', userId)

      // Delete messages for user's leads
      await supabase.from('messages').delete().in('lead_id', leadIds)

      // Delete lead_label_junction for user's leads
      await supabase.from('lead_label_junction').delete().in('lead_id', leadIds)
    }

    // 2. Get funnel IDs to clean steps
    const { data: existingFunnels } = await supabase
      .from('funnels')
      .select('id')
      .eq('user_id', userId)

    if (existingFunnels && existingFunnels.length > 0) {
      const funnelIds = existingFunnels.map((f: { id: string }) => f.id)
      await supabase.from('funnel_steps').delete().in('funnel_id', funnelIds)
    }

    // 3. Delete top-level user data
    await supabase.from('triggers').delete().eq('user_id', userId)
    await supabase.from('funnels').delete().eq('user_id', userId)
    await supabase.from('leads').delete().eq('user_id', userId)
    await supabase.from('lead_labels').delete().eq('user_id', userId)

    // === INSERT NEW DATA ===

    // Labels (6)
    const labelsData = [
      { user_id: userId, name: 'Cliente VIP', color: '#10B981' },
      { user_id: userId, name: 'Interessado', color: '#F59E0B' },
      { user_id: userId, name: 'Novo Lead', color: '#3B82F6' },
      { user_id: userId, name: 'Aguardando', color: '#8B5CF6' },
      { user_id: userId, name: 'Comprou', color: '#EC4899' },
      { user_id: userId, name: 'Inativo', color: '#6B7280' },
    ]

    const { data: labels, error: labelsError } = await supabase
      .from('lead_labels')
      .insert(labelsData)
      .select()
    if (labelsError) throw labelsError

    // Leads (5)
    const now = Date.now()
    const h = 3600000
    const m = 60000

    const leadsData = [
      {
        user_id: userId, phone: '+55 11 99999-1234', name: 'Maria Silva',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        last_message: 'Quero saber mais sobre o plano premium!',
        last_message_time: new Date(now - 5 * m).toISOString(),
        unread_count: 3, status: 'hot', is_pinned: true,
        arrival_source: 'meta_ads', has_purchased: false,
      },
      {
        user_id: userId, phone: '+55 11 98888-5678', name: 'João Santos',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
        last_message: 'Qual o prazo de entrega para SP?',
        last_message_time: new Date(now - 30 * m).toISOString(),
        unread_count: 1, status: 'warm', is_pinned: false,
        arrival_source: 'organic', has_purchased: false,
      },
      {
        user_id: userId, phone: '+55 21 97777-9012', name: 'Ana Costa',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        last_message: 'Recebi o produto, adorei! Obrigada 😍',
        last_message_time: new Date(now - 2 * h).toISOString(),
        unread_count: 0, status: 'warm', is_pinned: false,
        arrival_source: 'meta_ads', has_purchased: true,
      },
      {
        user_id: userId, phone: '+55 31 96666-3456', name: 'Pedro Lima',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
        last_message: 'Vou pensar e retorno semana que vem.',
        last_message_time: new Date(now - 24 * h).toISOString(),
        unread_count: 0, status: 'cold', is_pinned: false,
        arrival_source: 'referral', has_purchased: false,
      },
      {
        user_id: userId, phone: '+55 41 95555-7890', name: 'Carla Mendes',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla',
        last_message: 'Fechado! Vou fazer o pedido agora mesmo.',
        last_message_time: new Date(now - 4 * h).toISOString(),
        unread_count: 0, status: 'hot', is_pinned: true,
        arrival_source: 'meta_ads', has_purchased: true,
      },
    ]

    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsData)
      .select()
    if (leadsError) throw leadsError

    // Messages (6-8 per lead, varied types/status/timestamps)
    const messagesData: Array<{
      lead_id: string; content: string; type: string;
      direction: string; status: string; timestamp: string;
      file_url?: string; file_name?: string;
    }> = []

    const leadConversations = [
      // Maria - hot lead, active conversation
      [
        { content: 'Oi! Vi o anúncio de vocês no Instagram 😊', type: 'text', dir: 'received', status: 'read', offset: -48 * h },
        { content: 'Olá Maria! Que bom ter você aqui! Como posso ajudar?', type: 'text', dir: 'sent', status: 'read', offset: -47.5 * h },
        { content: 'Vocês vendem produtos naturais né? Quais os mais vendidos?', type: 'text', dir: 'received', status: 'read', offset: -47 * h },
        { content: 'Sim! Nossos top 3 são: Sérum Vitamina C, Creme Anti-idade e Protetor Solar. Vou te mandar uma foto!', type: 'text', dir: 'sent', status: 'read', offset: -46 * h },
        { content: 'Catálogo de produtos', type: 'image', dir: 'sent', status: 'delivered', offset: -46 * h, file_url: 'https://picsum.photos/400/300?random=1', file_name: 'catalogo.jpg' },
        { content: 'Que lindo! Quanto custa o sérum?', type: 'text', dir: 'received', status: 'read', offset: -2 * h },
        { content: 'O sérum sai por R$ 89,90 e o kit completo por R$ 199,90 com frete grátis!', type: 'text', dir: 'sent', status: 'delivered', offset: -1 * h },
        { content: 'Quero saber mais sobre o plano premium!', type: 'text', dir: 'received', status: 'delivered', offset: -5 * m },
      ],
      // João - warm lead
      [
        { content: 'Boa tarde, tudo bem?', type: 'text', dir: 'received', status: 'read', offset: -36 * h },
        { content: 'Boa tarde João! Tudo ótimo, e você?', type: 'text', dir: 'sent', status: 'read', offset: -35.5 * h },
        { content: 'Tudo certo! Vi que vocês têm entrega para todo Brasil, é verdade?', type: 'text', dir: 'received', status: 'read', offset: -35 * h },
        { content: 'Sim! Entregamos em todo Brasil. Para capitais o prazo é de 3-5 dias úteis.', type: 'text', dir: 'sent', status: 'read', offset: -34 * h },
        { content: 'Áudio explicando opções de frete', type: 'audio', dir: 'sent', status: 'read', offset: -34 * h, file_url: 'https://example.com/audio1.ogg', file_name: 'frete.ogg' },
        { content: 'Show! E pra interior de SP?', type: 'text', dir: 'received', status: 'read', offset: -10 * h },
        { content: 'Qual o prazo de entrega para SP?', type: 'text', dir: 'received', status: 'delivered', offset: -30 * m },
      ],
      // Ana - purchased, satisfied
      [
        { content: 'Olá! Fiz um pedido ontem, número #4521. Quero confirmar o endereço.', type: 'text', dir: 'received', status: 'read', offset: -40 * h },
        { content: 'Oi Ana! Vou verificar agora mesmo. Um momento!', type: 'text', dir: 'sent', status: 'read', offset: -39.5 * h },
        { content: 'Confirmado! Endereço: Rua das Flores, 123 - RJ. Correto?', type: 'text', dir: 'sent', status: 'read', offset: -39 * h },
        { content: 'Isso mesmo! Obrigada pela agilidade 🙏', type: 'text', dir: 'received', status: 'read', offset: -38 * h },
        { content: 'Seu pedido foi enviado! Código de rastreio: BR123456789', type: 'text', dir: 'sent', status: 'read', offset: -20 * h },
        { content: 'Foto do produto embalado', type: 'image', dir: 'sent', status: 'read', offset: -20 * h, file_url: 'https://picsum.photos/400/300?random=2', file_name: 'pedido.jpg' },
        { content: 'Recebi o produto, adorei! Obrigada 😍', type: 'text', dir: 'received', status: 'read', offset: -2 * h },
      ],
      // Pedro - cold, hesitant
      [
        { content: 'Oi, tenho interesse no curso de marketing digital.', type: 'text', dir: 'received', status: 'read', offset: -72 * h },
        { content: 'Olá Pedro! Nosso curso tem 40h de conteúdo prático. Quer saber mais?', type: 'text', dir: 'sent', status: 'read', offset: -71 * h },
        { content: 'Qual o valor?', type: 'text', dir: 'received', status: 'read', offset: -70 * h },
        { content: 'O investimento é de 12x R$ 97 ou R$ 997 à vista com 15% de desconto.', type: 'text', dir: 'sent', status: 'read', offset: -69 * h },
        { content: 'Hmm, tá um pouco caro pra mim agora...', type: 'text', dir: 'received', status: 'read', offset: -48 * h },
        { content: 'Entendo! Temos uma turma nova em março com condições especiais. Posso te avisar?', type: 'text', dir: 'sent', status: 'read', offset: -47 * h },
        { content: 'Vou pensar e retorno semana que vem.', type: 'text', dir: 'received', status: 'read', offset: -24 * h },
      ],
      // Carla - hot, closing
      [
        { content: 'Boa noite! Quero fazer um pedido grande pra minha loja.', type: 'text', dir: 'received', status: 'read', offset: -30 * h },
        { content: 'Boa noite Carla! Que ótimo! Trabalhamos com atacado a partir de 50 unidades.', type: 'text', dir: 'sent', status: 'read', offset: -29.5 * h },
        { content: 'Perfeito! Quero 100 unidades do Sérum e 50 do Creme.', type: 'text', dir: 'received', status: 'read', offset: -29 * h },
        { content: 'Ótima escolha! Para esse volume, consigo um desconto especial de 25%.', type: 'text', dir: 'sent', status: 'read', offset: -28 * h },
        { content: 'Tabela de preços atacado', type: 'document', dir: 'sent', status: 'read', offset: -28 * h, file_url: 'https://example.com/tabela.pdf', file_name: 'tabela-atacado.pdf' },
        { content: 'Excelente! O pagamento pode ser por boleto?', type: 'text', dir: 'received', status: 'read', offset: -10 * h },
        { content: 'Sim! Geramos boleto com 30 dias. Vou preparar o orçamento formal.', type: 'text', dir: 'sent', status: 'delivered', offset: -6 * h },
        { content: 'Fechado! Vou fazer o pedido agora mesmo.', type: 'text', dir: 'received', status: 'read', offset: -4 * h },
      ],
    ]

    for (let i = 0; i < leads.length; i++) {
      const conv = leadConversations[i]
      for (const msg of conv) {
        messagesData.push({
          lead_id: leads[i].id,
          content: msg.content,
          type: msg.type,
          direction: msg.dir,
          status: msg.status,
          timestamp: new Date(now + msg.offset).toISOString(),
          ...(msg.file_url ? { file_url: msg.file_url, file_name: msg.file_name } : {}),
        })
      }
    }

    const { error: messagesError } = await supabase.from('messages').insert(messagesData)
    if (messagesError) throw messagesError

    // Label assignments
    if (labels && leads) {
      const junctionData = [
        { lead_id: leads[0].id, label_id: labels[0].id }, // Maria -> VIP
        { lead_id: leads[0].id, label_id: labels[1].id }, // Maria -> Interessado
        { lead_id: leads[1].id, label_id: labels[2].id }, // João -> Novo Lead
        { lead_id: leads[2].id, label_id: labels[0].id }, // Ana -> VIP
        { lead_id: leads[2].id, label_id: labels[4].id }, // Ana -> Comprou
        { lead_id: leads[3].id, label_id: labels[3].id }, // Pedro -> Aguardando
        { lead_id: leads[3].id, label_id: labels[5].id }, // Pedro -> Inativo
        { lead_id: leads[4].id, label_id: labels[0].id }, // Carla -> VIP
        { lead_id: leads[4].id, label_id: labels[4].id }, // Carla -> Comprou
      ]
      const { error: junctionError } = await supabase.from('lead_label_junction').insert(junctionData)
      if (junctionError) throw junctionError
    }

    // Funnels (5)
    const funnelsData = [
      {
        user_id: userId, name: 'Boas-vindas',
        description: 'Sequência de boas-vindas para novos leads',
        color: '#10B981', is_favorite: true, order_position: 0,
        conversions: 15, total_sent: 45, total_duration_seconds: 3600,
      },
      {
        user_id: userId, name: 'Recuperação de Carrinho',
        description: 'Recuperar leads que abandonaram o carrinho',
        color: '#F59E0B', is_favorite: true, order_position: 1,
        conversions: 8, total_sent: 32, total_duration_seconds: 7200,
      },
      {
        user_id: userId, name: 'Promoção Semanal',
        description: 'Ofertas especiais toda semana',
        color: '#3B82F6', is_favorite: false, order_position: 2,
        conversions: 22, total_sent: 120, total_duration_seconds: 1800,
      },
      {
        user_id: userId, name: 'Follow-up Automático',
        description: 'Acompanhamento automático após primeiro contato',
        color: '#8B5CF6', is_favorite: true, order_position: 3,
        conversions: 12, total_sent: 60, total_duration_seconds: 5400,
      },
      {
        user_id: userId, name: 'Fechamento VIP',
        description: 'Sequência especial para leads quentes prontos para comprar',
        color: '#EC4899', is_favorite: false, order_position: 4,
        conversions: 5, total_sent: 18, total_duration_seconds: 4200,
      },
    ]

    const { data: funnels, error: funnelsError } = await supabase
      .from('funnels')
      .insert(funnelsData)
      .select()
    if (funnelsError) throw funnelsError

    // Funnel steps
    const stepsData: Array<{
      funnel_id: string; type: string; content: string;
      delay_minutes: number; show_typing: boolean; order_position: number;
      file_url?: string; file_name?: string; question_settings?: object;
    }> = []

    for (const funnel of funnels) {
      switch (funnel.name) {
        case 'Boas-vindas':
          stepsData.push(
            { funnel_id: funnel.id, type: 'text', content: 'Olá! 👋 Seja bem-vindo(a)! Estamos muito felizes em ter você por aqui.', delay_minutes: 0, show_typing: true, order_position: 0 },
            { funnel_id: funnel.id, type: 'delay', content: '', delay_minutes: 2, show_typing: false, order_position: 1 },
            { funnel_id: funnel.id, type: 'text', content: 'Temos produtos incríveis esperando por você! Quer conhecer nossas ofertas especiais?', delay_minutes: 0, show_typing: true, order_position: 2 },
            { funnel_id: funnel.id, type: 'question', content: 'Como posso te ajudar hoje?', delay_minutes: 1, show_typing: true, order_position: 3, question_settings: { enabled: true, questionText: 'Como posso te ajudar hoje?', waitMinutes: 5, autoResponseText: 'Sem problemas! Estou aqui quando precisar.' } },
          )
          break
        case 'Recuperação de Carrinho':
          stepsData.push(
            { funnel_id: funnel.id, type: 'text', content: 'Ei! 🛒 Notamos que você deixou alguns itens no carrinho...', delay_minutes: 0, show_typing: true, order_position: 0 },
            { funnel_id: funnel.id, type: 'delay', content: '', delay_minutes: 30, show_typing: false, order_position: 1 },
            { funnel_id: funnel.id, type: 'text', content: 'Temos um cupom especial de 10% OFF para você finalizar sua compra! Use: VOLTA10', delay_minutes: 0, show_typing: true, order_position: 2 },
          )
          break
        case 'Promoção Semanal':
          stepsData.push(
            { funnel_id: funnel.id, type: 'text', content: '🔥 PROMOÇÃO DA SEMANA! Produtos com até 40% de desconto!', delay_minutes: 0, show_typing: true, order_position: 0 },
            { funnel_id: funnel.id, type: 'image', content: 'Confira nossa seleção especial!', delay_minutes: 1, show_typing: false, order_position: 1, file_url: 'https://picsum.photos/400/300', file_name: 'promocao.jpg' },
          )
          break
        case 'Follow-up Automático':
          stepsData.push(
            { funnel_id: funnel.id, type: 'text', content: 'Oi! 😊 Passando pra saber se ficou com alguma dúvida sobre nossos produtos.', delay_minutes: 0, show_typing: true, order_position: 0 },
            { funnel_id: funnel.id, type: 'delay', content: '', delay_minutes: 60, show_typing: false, order_position: 1 },
            { funnel_id: funnel.id, type: 'question', content: 'Posso te ajudar com algo mais?', delay_minutes: 0, show_typing: true, order_position: 2, question_settings: { enabled: true, questionText: 'Posso te ajudar com algo mais?', waitMinutes: 10, autoResponseText: 'Tudo bem! Se precisar, é só chamar. Até mais! 👋' } },
          )
          break
        case 'Fechamento VIP':
          stepsData.push(
            { funnel_id: funnel.id, type: 'text', content: '🌟 Olá! Preparamos uma condição EXCLUSIVA pra você!', delay_minutes: 0, show_typing: true, order_position: 0 },
            { funnel_id: funnel.id, type: 'delay', content: '', delay_minutes: 5, show_typing: false, order_position: 1 },
            { funnel_id: funnel.id, type: 'audio', content: 'Mensagem de áudio com detalhes da oferta VIP', delay_minutes: 0, show_typing: false, order_position: 2, file_url: 'https://example.com/oferta-vip.ogg', file_name: 'oferta-vip.ogg' },
            { funnel_id: funnel.id, type: 'text', content: 'Essa oferta é válida apenas por 24h! Aproveite agora e garanta seu desconto de 30% 🎉', delay_minutes: 2, show_typing: true, order_position: 3 },
          )
          break
      }
    }

    const { error: stepsError } = await supabase.from('funnel_steps').insert(stepsData)
    if (stepsError) throw stepsError

    // Triggers (5)
    const triggersData = [
      { user_id: userId, name: 'Novo Lead do Instagram', description: 'Inicia funil de boas-vindas quando um lead chega via Instagram', icon: 'Instagram', action: funnels[0].id, is_active: true },
      { user_id: userId, name: 'Carrinho Abandonado', description: 'Dispara após 1 hora sem finalizar compra', icon: 'ShoppingCart', action: funnels[1].id, is_active: true },
      { user_id: userId, name: 'Promoção Automática', description: 'Envia promoção toda segunda-feira', icon: 'Calendar', action: funnels[2].id, is_active: false },
      { user_id: userId, name: 'Follow-up 24h', description: 'Envia follow-up automático 24h após primeiro contato', icon: 'Clock', action: funnels[3].id, is_active: true },
      { user_id: userId, name: 'Oferta VIP', description: 'Dispara sequência VIP para leads com alto engajamento', icon: 'Star', action: funnels[4].id, is_active: true },
    ]

    const { error: triggersError } = await supabase.from('triggers').insert(triggersData)
    if (triggersError) throw triggersError

    return new Response(JSON.stringify({
      success: true,
      message: 'Dados de exemplo criados com sucesso!',
      counts: {
        leads: leads.length,
        labels: labels?.length || 0,
        funnels: funnels.length,
        triggers: triggersData.length,
        messages: messagesData.length,
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
