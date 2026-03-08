# EIC School — Sistema de Relatórios
## Especificação Completa para Design (Figma AI)

---

## CONTEXTO DO PRODUTO

**O que é:** Sistema web para professores criarem e enviarem relatórios de desempenho para pais de alunos de uma escola de idiomas.

**Quem usa:**
- Professor → cria e preenche o relatório
- Coordenador → supervisiona e valida
- Pais/Responsáveis → recebem e confirmam o recebimento via QR Code

**Objetivo do relatório:** Ir além da nota — mostrar ao pai o que o filho sabe, onde pode melhorar, e o que fazer em casa para apoiar o aprendizado.

---

## PALETA DE CORES

| Nome | Hex | Uso |
|------|-----|-----|
| Laranja EIC | #EC5800 | CTA, destaques, badges primários |
| Azul petróleo | #070738 | Headers, texto escuro, fundo dark |
| Cinza escuro | #3D3D3D | Texto corpo |
| Marrom/mogno | #573000 | Accent secundário |
| Branco | #FFFFFF | Cards, fundo |
| Fundo suave | #F0F4F8 | Background de páginas |
| Verde | #16A34A | Aprovado, positivo |
| Dourado | #F5A623 | Médio, atenção |
| Vermelho suave | #DC2626 | Reprovado, crítico |
| Muted | #9CA3AF | Labels, textos secundários |

**Fonte:** Sora (Google Fonts) — arredondada, moderna, legível

---

## TELA 1 — LOGIN

**Quem acessa:** Professor ou Coordenador

**Campos:**
- E-mail institucional
- Senha
- Botão "Entrar" (laranja)
- Link "Esqueci minha senha"

**Lógica:**
- Sistema valida no Firebase Auth
- Professor vê apenas seus alunos
- Coordenador vê todos os relatórios da escola

**Visual esperado:** Centralizado, elegante, logo EIC no topo, fundo suave azul-acinzentado

---

## TELA 2 — DASHBOARD DO PROFESSOR

**O que o professor vê ao entrar:**

### Cards de resumo no topo (4 cards):
1. **Total de alunos** — número de alunos na sua turma
2. **Relatórios criados** — quantos já foram preenchidos
3. **Aguardando envio** — relatórios completos mas não enviados
4. **Confirmados pelos pais** — quantos pais já escanearam o QR

### Lista de alunos (tabela/cards):
- Nome do aluno
- Turma (ex: Teens 5, Adults 3)
- Status do relatório: `Não iniciado` / `Em progresso` / `Concluído` / `Enviado` / `Confirmado pelo pai`
- Botão de ação: "Criar Relatório" ou "Ver/Editar" ou "Baixar PDF"
- Badge colorido por status

**Filtros:** Por turma, por status

---

## TELA 3 — FORMULÁRIO DE CRIAÇÃO DO RELATÓRIO

### Estrutura em etapas (stepper no topo):
**Etapa 1 → Etapa 2 → Etapa 3 → Etapa 4 → Revisão**

---

### ETAPA 1: Dados Gerais

| Campo | Tipo | Opções/Exemplo |
|-------|------|----------------|
| Aluno | Select | Lista dos alunos do professor |
| Turma | Auto-preenchido | Teens 5 |
| Tipo de turma | Select | Regular / Intensivo / Particular |
| Período | Select | Mid-Year Report · 2026 / End-of-Year Report · 2026 |
| Avaliação | Select | 1 de 2 ciclos / 2 de 2 ciclos |
| Professor | Auto-preenchido | Nome do professor logado |
| Coordenador | Select | Lista de coordenadores cadastrados |

---

### ETAPA 2: Dados Quantitativos (Aval. 1 ou Aval. 2)

| Campo | Tipo | Opções |
|-------|------|--------|
| Frequência | Slider ou % input | 0–100% |
| Nota do teste | Slider ou % input | 0–100% |
| Situação | Select | Aprovado(a) / Em Progresso / Necessita Atenção / Reprovado(a) |
| Nível CEFR | Select | A1 / A1+ / A2 / A2+ / B1 / B1+ / B2 / B2+ / C1 / C2 |

---

### ETAPA 3: Avaliação por Competências

**6 competências, cada uma com:**

**Competências:**
1. Comportamento e Compromisso
2. Organização e Responsabilidade
3. Fala e Comunicação
4. Gramática e Vocabulário
5. Compreensão Auditiva
6. Leitura e Escrita

**Para cada competência, o professor preenche:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Nota | Botões 1–5 com estrelas ou círculos coloridos | 1=vermelho, 2=laranja, 3=dourado, 4=verde claro, 5=verde |
| O que vejo | Textarea livre | Observação pessoal do professor. Ex: "Demonstra dificuldade ao improvisar" |
| Por que importa | Select com preview | Escolhe de banco de frases pré-definido. Ex: "Falar em público desenvolve autoconfiança..." |
| O que fazer | Select com preview | Escolhe de banco de frases. Ex: "Assistir séries em inglês com legenda em inglês" |

**UX importante:** Ao selecionar a nota, o sistema sugere automaticamente as frases mais adequadas para "Por que importa" e "O que fazer"

---

### ETAPA 4: Observações Finais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| Voz do Professor | Textarea | Mensagem pessoal ao aluno/família. Ex: "Continue assim, você está evoluindo muito!" |
| Foco do Ciclo | Textarea | Texto descritivo do objetivo deste período |
| Foco técnico (só Aval.2) | Select | Área que o aluno deve focar no próximo ciclo |
| Horas de engajamento (só Aval.2) | Select | Estimativa de horas/semana fora da sala |
| Hábitos observados (só Aval.2) | Toggle buttons múltiplos | Ex: Faz lição / Assiste séries em inglês / Usa app / Pratica com família |

---

### REVISÃO FINAL

- Preview de todas as informações preenchidas
- Botão "Gerar PDF" (laranja, destaque)
- Botão "Salvar rascunho" (secundário)
- Aviso: "Após confirmar, o relatório ficará disponível para o responsável via QR Code"

---

## TELA 4 — VISUALIZAÇÃO DO RELATÓRIO (PDF / Web)

### O que o documento comunica:

**Seção 1 — Cabeçalho**
- Logo da escola
- Nome do aluno em destaque
- Badges: tipo de turma, turma, período
- Professor, Coordenador, Período, ciclo

**Seção 2 — Foco do Ciclo**
- Texto descritivo do objetivo do período em destaque

**Seção 3 — Snapshot de Desempenho**
- 4 cards: Frequência (%), Nota do Teste (%), Situação, Nível CEFR
- Se for Aval.2: cada card mostra comparação com Aval.1 (subiu/igual/desceu)

**Seção 4 — Perfil de Competências (Radar)**
- Gráfico radar com 6 eixos
- Linha tracejada azul = Aval.1
- Linha sólida laranja = Aval.2
- Cards de média geral ao lado

**Seção 5 — Avaliação por Competência**
- 6 cards detalhados, um por competência
- Barra de progresso colorida (1–5)
- 3 colunas: O que vejo / Por que importa / O que fazer

**Seção 6 — Voz do Professor**
- Card escuro com mensagem pessoal do professor
- Avatar com inicial do nome

**Seção 7 — Rodapé / Confirmação**
- QR Code → leva para página de confirmação
- Cards de assinatura: Coordenador / Professor / Responsável
- Campo para agendar reunião
- Valores da escola + contato

---

## TELA 5 — PAINEL DO COORDENADOR

**Visão macro da escola:**

### KPIs no topo:
- Total de alunos ativos
- % de relatórios concluídos
- % de pais que confirmaram
- Reuniões agendadas

### Tabela geral:
- Todos os alunos de todas as turmas
- Status por professor
- Filtros por turma / professor / status / período

### Ações:
- Aprovar relatório antes do envio (toggle)
- Ver relatório completo
- Baixar PDF individual ou em lote
- Exportar dados (CSV)

---

## TELA 6 — PÁGINA DO RESPONSÁVEL (pública, via QR)

**Acesso:** Pai escaneia QR Code no relatório impresso

**O que vê:**
- Versão web do relatório completo (mesma estética do PDF)
- Botão "Confirmar recebimento"
- Toggle "Desejo agendar uma reunião — Sim / Não"
- Se Sim: campo para sugerir data/horário
- Botão "Enviar" → registra no Firebase

---

## FLUXO COMPLETO

```
Professor faz login
    → Vê lista de alunos
    → Clica "Criar Relatório" 
    → Preenche Etapas 1–4
    → Revisa e confirma
    → Gera PDF automaticamente
    → PDF fica disponível no sistema
    → Coordenador aprova (opcional)
    → Professor imprime ou envia digitalmente
    → Pai recebe → escaneia QR
    → Pai confirma recebimento na página web
    → Sistema registra confirmação
    → Coordenador vê no painel
```

---

## STATES DE STATUS DOS RELATÓRIOS

| Status | Cor | Descrição |
|--------|-----|-----------|
| Não iniciado | Cinza | Aluno cadastrado, relatório não começou |
| Em progresso | Azul | Professor salvou rascunho |
| Concluído | Dourado | Preenchimento completo, não enviado |
| Enviado | Laranja | PDF gerado e disponível |
| Confirmado | Verde | Pai escaneou e confirmou |
| Reunião agendada | Verde escuro | Pai solicitou reunião |

---

## RESUMO PARA O FIGMA

**Criar 6 frames A4/Desktop:**
1. Login
2. Dashboard do Professor
3. Formulário de Criação (Etapa 3 — Competências, a mais complexa)
4. Relatório gerado (Página 1)
5. Relatório gerado (Página 2)
6. Painel do Coordenador

**Estilo:** SaaS moderno, fundo #F0F4F8, cards brancos com sombra suave, fonte Sora, acento laranja #EC5800, sem roxo/gradiente genérico.