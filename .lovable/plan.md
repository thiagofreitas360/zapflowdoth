
# Plano: Popular banco de dados com dados de exemplo

## Objetivo
Atualizar a Edge Function `seed-data` para criar mais dados realistas: 5 funis (atualmente 3), mais conversas com mensagens variadas, e garantir que o botao existente na pagina de Settings continue funcionando.

## Mudancas necessarias

### 1. Atualizar `supabase/functions/seed-data/index.ts`

**Funis (de 3 para 5):**
- Manter os 3 existentes (Boas-vindas, Recuperacao de Carrinho, Promocao Semanal)
- Adicionar "Follow-up Automatico" com steps de texto + question
- Adicionar "Fechamento VIP" com steps de texto + audio + delay

**Leads/Conversas (manter 5, enriquecer mensagens):**
- Aumentar de 3 para 6-8 mensagens por lead para conversas mais realistas
- Variar tipos de mensagem (texto, audio, imagem)
- Incluir mensagens com diferentes status (sent, delivered, read)
- Timestamps mais variados para simular conversas reais

**Triggers (de 3 para 5):**
- Adicionar 2 triggers extras vinculados aos novos funis

**Labels:**
- Adicionar mais 1-2 labels para variedade

### 2. Remover verificacao de dados existentes

A funcao atual bloqueia se o usuario ja tem dados. Vou adicionar um parametro `force` que permite re-popular limpando dados antigos, ou simplesmente remover essa verificacao para permitir adicionar mais dados.

**Abordagem escolhida:** Adicionar logica de limpeza antes de inserir quando dados ja existem -- assim o usuario pode clicar o botao novamente para resetar os dados.

## Detalhes tecnicos

### Estrutura dos novos funis

| Funil | Steps | Descricao |
|-------|-------|-----------|
| Boas-vindas | texto + delay + texto + question | Ja existe |
| Recuperacao de Carrinho | texto + delay + texto | Ja existe |
| Promocao Semanal | texto + imagem | Ja existe |
| Follow-up Automatico | texto + delay + question | Novo |
| Fechamento VIP | texto + delay + audio + texto | Novo |

### Conversas enriquecidas
Cada lead tera 5-8 mensagens alternando entre sent/received com timestamps espalhados nas ultimas 48h, incluindo variacao de tipos (text principal, alguns audio/image).

### Fluxo de limpeza
Quando `force: true` ou dados ja existem:
1. Deletar triggers do usuario
2. Deletar funnel_steps (via cascade ou manual)
3. Deletar funnels do usuario
4. Deletar messages (via lead_id)
5. Deletar lead_label_junction
6. Deletar leads do usuario
7. Deletar labels do usuario
8. Re-inserir tudo

### Arquivos modificados
- `supabase/functions/seed-data/index.ts` -- expandir dados e adicionar limpeza
- Deploy automatico da edge function
