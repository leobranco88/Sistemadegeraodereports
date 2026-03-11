// mockData.ts
// "Por que importa" e "O que fazer" — por competência e nota (1 a 5)
// Tom: direto, caloroso, voltado para pais e responsáveis.

export type CompetencyName =
  | "Comportamento e Compromisso"
  | "Organização e Responsabilidade"
  | "Fala e Comunicação"
  | "Gramática e Vocabulário"
  | "Compreensão Auditiva"
  | "Leitura e Escrita";

type RatingMap = Record<number, string[]>;

interface CompetencyTemplate {
  whyItMatters: RatingMap;
  whatToDo: RatingMap;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPORTAMENTO E COMPROMISSO
// ─────────────────────────────────────────────────────────────────────────────
const comportamento: CompetencyTemplate = {
  whyItMatters: {
    1: [
      "O engajamento em sala é a base de tudo. Sem atenção e presença ativa, mesmo o melhor conteúdo passa sem deixar marca.",
      "Aprender um idioma exige prática constante e intencional. Quando o compromisso com a aula é baixo, o progresso fica muito abaixo do potencial real do aluno.",
    ],
    2: [
      "A participação começa a aparecer, mas ainda de forma irregular. Em idiomas, a consistência é o que transforma esforço em resultado.",
      "Comprometer-se com as aulas cria uma rotina de exposição ao idioma — e rotina é o ingrediente mais importante para quem quer alcançar a fluência.",
    ],
    3: [
      "Um bom comportamento em sala garante que o aluno aproveite cada minuto de aula. Em idiomas, a exposição acumulada ao longo dos ciclos faz toda a diferença.",
      "Alunos presentes e engajados progridem de nível com mais regularidade, pois constroem uma base sólida aula após aula.",
    ],
    4: [
      "O compromisso do aluno com as aulas é notável e tem impacto direto no aprendizado. Quem participa ativamente aprende mais, retém melhor e avança mais rápido.",
      "A postura engajada em sala cria um ambiente onde aprender se torna natural. Isso é raro e muito valioso no processo de aquisição de um idioma.",
    ],
    5: [
      "O nível de comprometimento do aluno é excepcional. Alunos assim inspiram a turma e criam para si mesmos um ambiente de aprendizado muito mais rico.",
      "Quando um aluno combina presença, atenção e entusiasmo, o progresso é inevitável. Esse comportamento é o maior diferencial no caminho para a fluência.",
    ],
  },
  whatToDo: {
    1: [
      "Converse com seu filho(a) sobre a importância das aulas e o que ele(a) espera aprender. Entender o 'porquê' aumenta o engajamento naturalmente.",
      "Tente criar uma conversa leve após as aulas: 'O que você aprendeu hoje?' Esse pequeno hábito ajuda a criar senso de responsabilidade e pertencimento.",
    ],
    2: [
      "Ajude a criar uma rotina em torno das aulas — chegar descansado(a), com o material, sem distrações. Pequenos ajustes geram grandes mudanças.",
      "Reconheça os momentos em que seu filho(a) se sai bem e demonstra compromisso. O reforço positivo é muito mais poderoso do que a cobrança.",
    ],
    3: [
      "Continue incentivando a participação ativa. Perguntas simples como 'o que você praticou hoje?' ajudam a manter o foco e o interesse.",
      "Valorize o esforço do dia a dia — não apenas as notas. Alunos que se sentem reconhecidos tendem a se engajar ainda mais.",
    ],
    4: [
      "Mantenha o ambiente de apoio em casa. O engajamento em sala reflete um suporte familiar consistente — e isso faz toda a diferença.",
      "Incentive seu filho(a) a assumir ainda mais protagonismo: responder primeiro, fazer perguntas, ajudar os colegas. O próximo passo é a liderança.",
    ],
    5: [
      "Parabenize seu filho(a) — esse nível de comprometimento é construído com apoio, disciplina e motivação. Continue nutrindo esse ambiente em casa.",
      "Desafie-o(a) a ir além: participar de clubes de conversação, assistir a conteúdos em inglês ou se voluntariar para apresentações. Ele(a) está pronto(a).",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ORGANIZAÇÃO E RESPONSABILIDADE
// ─────────────────────────────────────────────────────────────────────────────
const organizacao: CompetencyTemplate = {
  whyItMatters: {
    1: [
      "Organização cria rotina, e rotina é o que permite revisar o conteúdo, fixar o vocabulário e avançar com segurança. Sem ela, o aprendizado se torna fragmentado.",
      "Responsabilidade com o material e as tarefas é o primeiro passo para a autonomia. Alunos que não desenvolvem esse hábito encontram mais dificuldades nos níveis avançados.",
    ],
    2: [
      "A organização está começando a aparecer, mas ainda de forma inconsistente. Criar hábitos simples agora economiza muito esforço no futuro.",
      "Trazer o material e entregar as tarefas no prazo pode parecer detalhe, mas é o que garante que o aluno não perca o fio da aprendizagem entre uma aula e outra.",
    ],
    3: [
      "Manter o material organizado e os compromissos em dia é o que permite ao aluno aproveitar cada aula sem precisar recuperar o atraso. É uma base sólida.",
      "A responsabilidade com as tarefas mostra maturidade no processo de aprendizado — e é justamente fora da sala que boa parte da fixação do idioma acontece.",
    ],
    4: [
      "A organização do aluno contribui diretamente para o ritmo da turma e para o próprio aprendizado. Alunos organizados aproveitam melhor as aulas e avançam com mais consistência.",
      "Responsabilidade é uma habilidade que vai muito além do idioma — ela forma estudantes mais autônomos e preparados para os desafios futuros.",
    ],
    5: [
      "O nível de organização e responsabilidade do aluno é exemplar. Essa disciplina é um dos maiores fatores de sucesso no aprendizado de longo prazo.",
      "Alunos altamente organizados criam para si mesmos uma vantagem real: chegam preparados, revisam com consistência e avançam com segurança.",
    ],
  },
  whatToDo: {
    1: [
      "Ajude a montar uma mochila-padrão para as aulas de inglês: livro, caderno e material sempre prontos. Rituais simples criam hábitos duradouros.",
      "Estabeleça um momento fixo na semana para revisar o que foi visto em aula — mesmo que seja apenas 10 minutos. Regularidade vale mais do que intensidade.",
    ],
    2: [
      "Use um caderno ou agenda simples para anotar as tarefas da aula. Ver o compromisso escrito aumenta a chance de cumprimento.",
      "Crie em casa um espaço fixo para os materiais de inglês. Quando tudo tem um lugar, a organização acontece quase automaticamente.",
    ],
    3: [
      "O hábito está formado — agora é aprofundar. Incentive seu filho(a) a revisar o caderno antes da próxima aula, mesmo que por poucos minutos.",
      "Valorize a responsabilidade do dia a dia. Reconhecer esse comportamento reforça o hábito e motiva o aluno a manter o padrão.",
    ],
    4: [
      "Continue apoiando essa rotina. Perguntas como 'você tem tarefa de inglês essa semana?' demonstram interesse e mantêm o aluno focado.",
      "Incentive-o(a) a ir além: criar um glossário pessoal de palavras novas ou organizar revisões antes dos testes são ótimos próximos passos.",
    ],
    5: [
      "Parabenize pela disciplina — ela é resultado de um ambiente familiar que valoriza o estudo. Continue sendo esse suporte.",
      "Sugira desafios mais avançados: criar resumos das unidades, montar um caderno de expressões ou planejar revisões autônomas antes das provas.",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FALA E COMUNICAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
const fala: CompetencyTemplate = {
  whyItMatters: {
    1: [
      "Falar é o grande objetivo de quem aprende um idioma. O medo de errar, quando não é trabalhado cedo, pode se tornar uma barreira difícil de superar nos níveis seguintes.",
      "A comunicação oral é onde o idioma ganha vida. Sem praticar a fala, o aluno pode saber as regras, mas travar na hora de se expressar.",
    ],
    2: [
      "O aluno já tenta se comunicar, mas ainda com hesitação. Essa fase é normal e importante — o próximo passo é aumentar a confiança para arriscar mais.",
      "Fluência não é perfeição — é coragem. Quanto mais o aluno praticar, mesmo errando, mais natural a fala se tornará.",
    ],
    3: [
      "O aluno se comunica bem dentro do esperado para o nível. Continuar praticando a fala fora da sala é o que vai acelerar o caminho para a fluência.",
      "A comunicação oral já está estabelecida. Agora é hora de ampliar o repertório e ganhar mais naturalidade e espontaneidade na expressão.",
    ],
    4: [
      "A desenvoltura do aluno na fala é um diferencial importante. Comunicar-se bem em inglês abre portas em todas as áreas — acadêmica, profissional e pessoal.",
      "Alunos que se expressam com confiança em sala avançam muito mais rápido, pois transformam cada interação em prática real.",
    ],
    5: [
      "A fluência em construção do aluno é impressionante para o nível. Essa habilidade, desenvolvida desde cedo, será um diferencial para toda a vida.",
      "Comunicar-se com naturalidade em outro idioma é uma conquista que vai muito além da sala de aula. O aluno está no caminho certo.",
    ],
  },
  whatToDo: {
    1: [
      "Em casa, crie momentos leves de prática oral: nomear objetos em inglês, cantar músicas ou assistir a desenhos. O objetivo é tirar o medo da língua.",
      "Elogie qualquer tentativa de falar em inglês, mesmo que imperfeita. A confiança para se arriscar é construída com encorajamento, não com correção constante.",
    ],
    2: [
      "Incentive seu filho(a) a responder em inglês quando o professor perguntar — mesmo que com poucas palavras. Cada tentativa conta.",
      "Assistir a séries ou vídeos em inglês com legenda em inglês é uma forma natural de desenvolver o ouvido e ganhar vocabulário para a fala.",
    ],
    3: [
      "Estimule conversas simples em inglês em casa: 'How was your day?' ou 'What did you eat today?' Prática informal também é prática.",
      "Aplicativos de conversação como Duolingo ou Speakly podem complementar bem as aulas e dar mais oportunidades de prática oral.",
    ],
    4: [
      "Incentive seu filho(a) a buscar desafios maiores: apresentações voluntárias, participação em clubes de conversação ou vídeos em inglês.",
      "Considere criar situações reais de uso do idioma: filmes sem legenda, séries em inglês ou interação com falantes nativos online.",
    ],
    5: [
      "O talento comunicativo do aluno merece ser nutrido. Considere atividades como teatro em inglês, debates ou intercâmbio cultural.",
      "Incentive a criação de conteúdo em inglês: gravar vídeos, escrever textos ou participar de comunidades online. O próximo nível é usar o idioma no mundo real.",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// GRAMÁTICA E VOCABULÁRIO
// ─────────────────────────────────────────────────────────────────────────────
const gramatica: CompetencyTemplate = {
  whyItMatters: {
    1: [
      "Gramática e vocabulário são a estrutura do idioma. Sem essa base, mesmo quem tem coragem de falar encontra dificuldade em se fazer entender com clareza.",
      "Um vocabulário limitado restringe o que o aluno consegue expressar e compreender. Ampliar essa base é essencial para avançar nos próximos níveis.",
    ],
    2: [
      "A base gramatical está em construção. Esse é um momento importante para consolidar os fundamentos antes de avançar para estruturas mais complexas.",
      "Vocabulário se constrói com exposição repetida. Quanto mais o aluno encontrar as palavras em contextos diferentes, mais elas se fixam.",
    ],
    3: [
      "O aluno aplica bem as estruturas do nível. Manter essa consistência é o que garante uma progressão sólida e confiante para os próximos módulos.",
      "Um vocabulário adequado ao nível é o que permite ao aluno se expressar com clareza e compreender o que lê e ouve sem grandes esforços.",
    ],
    4: [
      "O domínio gramatical do aluno está acima do esperado, o que se reflete diretamente na qualidade das produções orais e escritas.",
      "Um vocabulário rico e variado é o que diferencia um aluno competente de um aluno fluente. O aluno está construindo exatamente isso.",
    ],
    5: [
      "O domínio gramatical e o repertório vocabular do aluno são excepcionais para o nível. Essa base sólida abre caminho para a fluência real.",
      "Alunos com esse nível de precisão linguística têm uma vantagem enorme na hora de escrever, falar e compreender em situações reais.",
    ],
  },
  whatToDo: {
    1: [
      "Revisar as estruturas trabalhadas em aula pelo menos uma vez por semana faz uma diferença enorme na fixação. Mesmo 10 minutos já ajudam.",
      "Aplicativos como Anki ou Quizlet permitem criar cartões de vocabulário personalizados — uma forma eficaz e divertida de revisar as palavras da aula.",
    ],
    2: [
      "Incentive a leitura de textos simples em inglês: legendas de vídeos, posts em inglês nas redes sociais ou livros de nível iniciante. O contato em contexto ajuda muito.",
      "Crie o hábito de anotar palavras novas em um caderno de vocabulário pessoal. Revisar essas listas semanalmente acelera a fixação.",
    ],
    3: [
      "Para ampliar o vocabulário, experimente assistir a vídeos curtos em inglês sobre temas que seu filho(a) gosta. Aprender por interesse é muito mais eficaz.",
      "Jogos de palavras em inglês — palavras cruzadas, word search ou jogos de associação — são formas leves e eficazes de ampliar o repertório.",
    ],
    4: [
      "Incentive o uso do inglês em situações reais: ler notícias, assistir documentários ou jogar games em inglês. Quanto mais contexto, mais o vocabulário se expande.",
      "Escrever pequenos textos em inglês — um diário, uma resenha de filme — é um exercício poderoso para consolidar gramática e vocabulário.",
    ],
    5: [
      "Desafie seu filho(a) com textos mais complexos: artigos, podcasts ou livros em inglês. Ele(a) está pronto(a) para consumir o idioma de forma mais autônoma.",
      "Considere preparação para certificações internacionais como Cambridge ou TOEFL. O nível atual do aluno já é uma base muito sólida para isso.",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPREENSÃO AUDITIVA
// ─────────────────────────────────────────────────────────────────────────────
const auditiva: CompetencyTemplate = {
  whyItMatters: {
    1: [
      "Ouvir e entender é a habilidade mais usada no dia a dia de quem vive o idioma. Desenvolvê-la desde cedo é essencial para qualquer situação real de comunicação.",
      "A compreensão auditiva é o que permite ao aluno participar de conversas, assistir a filmes e entender músicas. Sem ela, o idioma fica restrito ao papel.",
    ],
    2: [
      "O aluno já reconhece algumas estruturas ao ouvir, mas ainda precisa de mais exposição para ganhar confiança. Esse progresso é natural e esperado nesta fase.",
      "Ouvir o idioma com frequência é o que treina o cérebro a processar os sons e ritmos de uma nova língua. Quanto mais exposição, mais rápido o progresso.",
    ],
    3: [
      "A compreensão auditiva do aluno está dentro do esperado para o nível. Continuar se expondo ao idioma fora da sala vai acelerar ainda mais esse desenvolvimento.",
      "Entender instruções e diálogos em inglês é uma habilidade que cresce com o tempo e a exposição. O aluno está no caminho certo.",
    ],
    4: [
      "A capacidade auditiva do aluno é um diferencial importante. Quem entende bem o que ouve consegue participar de conversas reais com muito mais confiança.",
      "Uma boa compreensão auditiva é o que torna o idioma vivo — o aluno consegue usá-lo não só em sala, mas no mundo real.",
    ],
    5: [
      "A compreensão auditiva do aluno é excelente para o nível. Essa habilidade é fundamental para qualquer uso real do idioma — viagens, trabalho, estudos.",
      "Alunos com esse nível de escuta já conseguem se adaptar a diferentes sotaques, velocidades e contextos. Isso é fluência auditiva real.",
    ],
  },
  whatToDo: {
    1: [
      "Coloque músicas em inglês para tocar em casa com naturalidade — no carro, durante as refeições. A exposição passiva já ajuda o cérebro a se acostumar com os sons.",
      "Comece com vídeos curtos no YouTube voltados para aprendizes de inglês, com fala mais lenta e clara. O importante é criar o hábito de ouvir o idioma.",
    ],
    2: [
      "Assistir a desenhos animados ou séries infantis em inglês é uma forma divertida e eficaz de desenvolver a compreensão auditiva sem pressão.",
      "Use legendas em inglês (não em português) ao assistir a conteúdos. Isso conecta o que o aluno ouve com o que lê, acelerando a fixação.",
    ],
    3: [
      "Incentive seu filho(a) a ouvir podcasts simples em inglês sobre temas de interesse. Existem opções excelentes para todos os níveis e idades.",
      "Músicas em inglês com a letra na mão são um exercício ótimo: ouvir, acompanhar a letra e tentar entender o contexto antes de traduzir.",
    ],
    4: [
      "Desafie com conteúdos sem legenda — filmes, séries, vlogs. O objetivo é se acostumar a entender mesmo sem apoio visual das palavras.",
      "Podcasts em inglês sobre temas que o aluno gosta são ideais para esse nível. A combinação de interesse e escuta é muito poderosa.",
    ],
    5: [
      "Explore conteúdos com diferentes sotaques: britânico, australiano, americano. O aluno já tem base para isso e vai se surpreender com a própria capacidade.",
      "Considere ouvir audiobooks em inglês — é uma forma sofisticada e eficaz de manter e expandir a compreensão auditiva no nível mais alto.",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// LEITURA E ESCRITA
// ─────────────────────────────────────────────────────────────────────────────
const leituraEscrita: CompetencyTemplate = {
  whyItMatters: {
    1: [
      "Ler e escrever em inglês são habilidades que sustentam todas as outras. Sem elas, fica difícil avançar nos níveis e usar o idioma de forma completa.",
      "A escrita consolida o que foi aprendido em sala — é quando o aluno prova para si mesmo que aprendeu. Desenvolver essa habilidade desde cedo faz toda a diferença.",
    ],
    2: [
      "O aluno já demonstra alguma familiaridade com o inglês escrito, mas ainda precisa de prática regular para ganhar fluidez e precisão.",
      "Leitura e escrita se desenvolvem com exposição e prática constante. Pequenos exercícios diários têm impacto muito maior do que sessões longas e esporádicas.",
    ],
    3: [
      "O aluno lê e escreve dentro do esperado para o nível. Manter o hábito de leitura e praticar a escrita fora da sala vai acelerar o progresso.",
      "Habilidades de leitura e escrita bem desenvolvidas são o que permite ao aluno usar o idioma de forma autônoma — em viagens, estudos e trabalho.",
    ],
    4: [
      "O desempenho em leitura e escrita do aluno está acima do esperado. Essas habilidades são fundamentais para qualquer uso acadêmico ou profissional do inglês.",
      "Um bom escritor em inglês é alguém que pensa no idioma — e o aluno já dá sinais claros disso. Essa é uma conquista muito importante.",
    ],
    5: [
      "O nível de leitura e escrita do aluno é excepcional. Essas habilidades são o que separa quem sabe inglês de quem realmente domina o idioma.",
      "Alunos com esse desempenho já conseguem produzir textos claros, coerentes e naturais em inglês — uma habilidade valorizada em qualquer contexto.",
    ],
  },
  whatToDo: {
    1: [
      "Comece com leituras curtíssimas: legendas de fotos, títulos de notícias ou histórias de uma página. O objetivo é criar o hábito sem gerar resistência.",
      "Peça para seu filho(a) escrever 2 ou 3 frases simples em inglês por semana sobre algo que aconteceu. Não corrija — incentive. A fluência vem antes da perfeição.",
    ],
    2: [
      "Livros ilustrados em inglês são um ótimo ponto de partida. A imagem ajuda a construir contexto e torna a leitura menos intimidadora.",
      "Incentive a escrita informal em inglês: mensagens de texto para amigos, legendas de fotos, listas de tarefas. Escrever no cotidiano é muito eficaz.",
    ],
    3: [
      "Leitura de livros em inglês adequados ao nível é um dos melhores investimentos. Séries como Diary of a Wimpy Kid ou Magic Tree House são ótimas opções.",
      "Escrever pequenos parágrafos sobre o dia, um filme assistido ou um lugar visitado é um exercício simples e poderoso para desenvolver a escrita.",
    ],
    4: [
      "Incentive a leitura de textos mais longos e variados: artigos, contos, notícias. Quanto mais diversidade de leitura, mais rico o repertório escrito.",
      "Diários, cartas ou resenhas em inglês são exercícios excelentes para esse nível. O foco deve ser na expressão das ideias, não na perfeição gramatical.",
    ],
    5: [
      "O aluno está pronto para conteúdos autênticos: livros, artigos, reportagens em inglês. Esse é o nível onde o idioma se torna uma ferramenta real de aprendizado.",
      "Considere preparação para certificações internacionais como Cambridge ou IELTS. As habilidades de leitura e escrita do aluno já são uma base sólida para isso.",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const competencyTemplatesByName: Record<CompetencyName, CompetencyTemplate> = {
  "Comportamento e Compromisso": comportamento,
  "Organização e Responsabilidade": organizacao,
  "Fala e Comunicação": fala,
  "Gramática e Vocabulário": gramatica,
  "Compreensão Auditiva": auditiva,
  "Leitura e Escrita": leituraEscrita,
};

// Formato legado — mantém compatibilidade com CreateReport.tsx existente
// O select de cada competência usa: competencyTemplates.whyItMatters[rating]
// Mas agora o ideal é usar competencyTemplatesByName[comp.name].whyItMatters[rating]
export const competencyTemplates = {
  whyItMatters: {
    1: comportamento.whyItMatters[1],
    2: comportamento.whyItMatters[2],
    3: comportamento.whyItMatters[3],
    4: comportamento.whyItMatters[4],
    5: comportamento.whyItMatters[5],
  },
  whatToDo: {
    1: comportamento.whatToDo[1],
    2: comportamento.whatToDo[2],
    3: comportamento.whatToDo[3],
    4: comportamento.whatToDo[4],
    5: comportamento.whatToDo[5],
  },
};
