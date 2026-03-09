import { Student, Report, User } from "../types";

export const mockUsers: User[] = [];
export const mockStudents: Student[] = [];
export const mockReports: Report[] = [];

export const competencyTemplates = {
  whyItMatters: {
    1: [
      "Esta competência é fundamental para o desenvolvimento acadêmico e pessoal do aluno.",
      "Melhorar nesta área abrirá novas oportunidades de comunicação e aprendizado.",
    ],
    2: [
      "Esta habilidade precisa de atenção para que o aluno avance de forma mais consistente.",
      "Desenvolver esta competência facilitará o aprendizado de outros aspectos do idioma.",
    ],
    3: [
      "Esta é uma área de desenvolvimento importante para atingir fluência no idioma.",
      "Aprimorar esta competência trará mais confiança na comunicação.",
    ],
    4: [
      "Esta competência está bem desenvolvida e serve como base para avanços futuros.",
      "O domínio desta área facilita a progressão para níveis mais avançados.",
    ],
    5: [
      "Esta é uma área de excelência que demonstra dedicação e talento.",
      "O domínio desta competência é exemplar e serve de modelo para outros.",
    ],
  },
  whatToDo: {
    1: [
      "Estabelecer uma rotina de estudos com metas pequenas e alcançáveis.",
      "Buscar apoio extra através de aulas particulares ou grupos de estudo.",
      "Dedicar pelo menos 30 minutos diários para prática focada nesta área.",
    ],
    2: [
      "Praticar regularmente com exercícios específicos desta competência.",
      "Usar aplicativos educacionais que reforcem esta habilidade de forma lúdica.",
      "Revisar conteúdos anteriores para fortalecer a base antes de avançar.",
    ],
    3: [
      "Manter a prática constante e buscar novas formas de aplicar o conhecimento.",
      "Explorar conteúdos em inglês sobre assuntos de interesse pessoal.",
      "Participar de atividades que envolvam o uso desta competência.",
    ],
    4: [
      "Continuar praticando para manter o nível e buscar desafios maiores.",
      "Explorar materiais mais avançados para expandir ainda mais esta habilidade.",
      "Compartilhar conhecimentos com colegas para reforçar o aprendizado.",
    ],
    5: [
      "Manter a excelência através de prática contínua e exposição variada ao idioma.",
      "Explorar conteúdos nativos e autênticos para aprofundar ainda mais.",
      "Usar esta força para apoiar o desenvolvimento de outras competências.",
    ],
  },
};
