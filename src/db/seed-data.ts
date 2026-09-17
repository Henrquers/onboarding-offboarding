/**
 * Dados iniciais do app.
 *
 * O catálogo abaixo é PROVISÓRIO: foi montado com as providências citadas na
 * conversa de abertura do projeto, enquanto as listas oficiais de onboarding e
 * offboarding do escritório não chegam. Tudo aqui pode ser editado depois pela
 * tela "Catálogo", sem mexer no código e sem afetar processos já abertos.
 */

export type SementeUsuario = {
  nome: string;
  email: string;
  papel: "ADMIN" | "SOCIO" | "ASSISTENTE";
};

export type SementeResponsavel = {
  chave: string;
  nome: string;
  tipo: "USUARIO" | "EXTERNO";
  emailUsuario?: string;
  contato?: string;
  observacoes?: string;
};

export type SementeTarefa = {
  tipo: "ONBOARDING" | "OFFBOARDING";
  titulo: string;
  descricao?: string;
  sistema?: string;
  responsavel: string;
  comoPedir?: string;
  prazoDias?: number;
  obrigatoria?: boolean;
};

// Confira os e-mails antes de rodar o seed: eles são a chave de login.
export const usuariosIniciais: SementeUsuario[] = [
  {
    nome: "Henrique",
    email: "henrique@colettarodrigues.com.br",
    papel: "ADMIN",
  },
  { nome: "Diogo", email: "diogo@colettarodrigues.com.br", papel: "SOCIO" },
  { nome: "João", email: "joao@colettarodrigues.com.br", papel: "SOCIO" },
  {
    nome: "Gabriela",
    email: "gabriela@colettarodrigues.com.br",
    papel: "ASSISTENTE",
  },
  {
    nome: "Neiva",
    email: "neiva@colettarodrigues.com.br",
    papel: "ASSISTENTE",
  },
];

export const responsaveisIniciais: SementeResponsavel[] = [
  {
    chave: "ti",
    nome: "TI / Infraestrutura",
    tipo: "EXTERNO",
    contato: "preencher o e-mail ou canal de chamados",
  },
  {
    chave: "imanage",
    nome: "Suporte iManage",
    tipo: "EXTERNO",
    contato: "preencher o canal de suporte",
    observacoes: "Sistema de gestão de documentos (GED).",
  },
  {
    chave: "legalmanager",
    nome: "Suporte Legal Manager",
    tipo: "EXTERNO",
    contato: "preencher o canal de suporte",
    observacoes: "Sistema de gestão do escritório.",
  },
  {
    chave: "site",
    nome: "Fornecedor do site",
    tipo: "EXTERNO",
    contato: "preencher o contato da agência/fornecedor",
  },
  {
    chave: "financeiro",
    nome: "Gabriela (assistente financeira)",
    tipo: "USUARIO",
    emailUsuario: "gabriela@colettarodrigues.com.br",
  },
  {
    chave: "administrativo",
    nome: "Neiva (assistente administrativa)",
    tipo: "USUARIO",
    emailUsuario: "neiva@colettarodrigues.com.br",
  },
  {
    chave: "socios",
    nome: "Sócios",
    tipo: "EXTERNO",
    observacoes: "Decisões que dependem de Henrique, Diogo ou João.",
  },
];

export const tarefasIniciais: SementeTarefa[] = [
  // ----------------------------- ONBOARDING -----------------------------
  {
    tipo: "ONBOARDING",
    titulo: "Criar conta de e-mail corporativo",
    descricao:
      "Criar a caixa da pessoa no domínio do escritório e definir a senha inicial.",
    sistema: "E-mail",
    responsavel: "ti",
    comoPedir:
      "Informar nome completo, cargo e o endereço desejado. Confirmar o padrão de nomenclatura usado no escritório.",
    prazoDias: 1,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Incluir nas chaves e listas de e-mail",
    descricao:
      "Adicionar o endereço às listas de distribuição pertinentes ao cargo e à área.",
    sistema: "E-mail",
    responsavel: "ti",
    comoPedir: "Listar quais chaves se aplicam ao cargo da pessoa.",
    prazoDias: 2,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Configurar assinatura de e-mail no padrão do escritório",
    sistema: "E-mail",
    responsavel: "administrativo",
    prazoDias: 3,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Criar usuário no Legal Manager",
    descricao: "Cadastro no sistema de gestão do escritório, com o perfil de acesso do cargo.",
    sistema: "Legal Manager",
    responsavel: "legalmanager",
    comoPedir: "Informar nome, e-mail corporativo, cargo e perfil de acesso.",
    prazoDias: 2,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Criar usuário no iManage",
    descricao: "Cadastro no GED com os grupos de segurança correspondentes ao cargo.",
    sistema: "iManage",
    responsavel: "imanage",
    comoPedir: "Informar nome, e-mail corporativo e os grupos de acesso.",
    prazoDias: 2,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Criar workspace pessoal privado no iManage",
    descricao: "Pasta pessoal da pessoa no GED, com acesso restrito a ela.",
    sistema: "iManage",
    responsavel: "imanage",
    prazoDias: 2,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Criar usuário no cloud",
    sistema: "Cloud",
    responsavel: "ti",
    prazoDias: 2,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Criar o perfil da pessoa no site",
    descricao: "Foto, minicurrículo, áreas de atuação e idiomas.",
    sistema: "Site",
    responsavel: "site",
    comoPedir:
      "Enviar foto em alta resolução, texto do perfil aprovado e a data a partir da qual pode ficar publicado.",
    prazoDias: 15,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Cadastrar na folha de pagamento",
    descricao: "Providência provisória no catálogo: confirmar com o financeiro.",
    sistema: "Financeiro",
    responsavel: "financeiro",
    prazoDias: 5,
  },
  {
    tipo: "ONBOARDING",
    titulo: "Entregar equipamento e acessos físicos",
    descricao: "Providência provisória no catálogo: confirmar com o administrativo.",
    sistema: "Infraestrutura",
    responsavel: "administrativo",
    prazoDias: 1,
  },

  // ----------------------------- OFFBOARDING ----------------------------
  {
    tipo: "OFFBOARDING",
    titulo: "Bloquear os acessos gerais no desligamento",
    descricao:
      "Derrubar sessões ativas e bloquear o login nos sistemas do escritório na data combinada.",
    sistema: "Geral",
    responsavel: "ti",
    comoPedir: "Confirmar data e horário exatos do corte antes de pedir.",
    prazoDias: 0,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Encerrar o usuário no Legal Manager",
    sistema: "Legal Manager",
    responsavel: "legalmanager",
    prazoDias: 1,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Encerrar o usuário no iManage",
    sistema: "iManage",
    responsavel: "imanage",
    prazoDias: 1,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Definir o destino do workspace pessoal no iManage",
    descricao:
      "Decidir entre transferir a guarda para um sócio, arquivar ou manter congelado, e executar.",
    sistema: "iManage",
    responsavel: "socios",
    prazoDias: 5,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Encerrar o usuário no cloud",
    sistema: "Cloud",
    responsavel: "ti",
    prazoDias: 1,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Remover das chaves e listas de e-mail",
    sistema: "E-mail",
    responsavel: "ti",
    prazoDias: 1,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Redirecionar o e-mail da pessoa para os sócios",
    descricao:
      "Encaminhamento das mensagens recebidas no endereço da pessoa desligada.",
    sistema: "E-mail",
    responsavel: "ti",
    comoPedir: "Informar para qual endereço o redirecionamento deve apontar e por quanto tempo.",
    prazoDias: 1,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Remover o perfil da pessoa do site",
    sistema: "Site",
    responsavel: "site",
    prazoDias: 3,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Recolher equipamento e acessos físicos",
    descricao: "Providência provisória no catálogo: confirmar com o administrativo.",
    sistema: "Infraestrutura",
    responsavel: "administrativo",
    prazoDias: 0,
  },
  {
    tipo: "OFFBOARDING",
    titulo: "Providenciar o acerto rescisório e a baixa na folha",
    descricao: "Providência provisória no catálogo: confirmar com o financeiro.",
    sistema: "Financeiro",
    responsavel: "financeiro",
    prazoDias: 10,
  },
];
