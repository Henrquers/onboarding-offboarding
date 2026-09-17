import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const papelUsuario = pgEnum("papel_usuario", [
  "ADMIN",
  "SOCIO",
  "ASSISTENTE",
]);

export const tipoProcesso = pgEnum("tipo_processo", [
  "ONBOARDING",
  "OFFBOARDING",
]);

export const statusProcesso = pgEnum("status_processo", [
  "EM_ANDAMENTO",
  "CONCLUIDO",
  "CANCELADO",
]);

export const statusTarefa = pgEnum("status_tarefa", [
  "PENDENTE",
  "SOLICITADA",
  "CONCLUIDA",
  "NAO_APLICAVEL",
  "BLOQUEADA",
]);

export const tipoResponsavel = pgEnum("tipo_responsavel", [
  "USUARIO",
  "EXTERNO",
]);

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  papel: papelUsuario("papel").notNull().default("ASSISTENTE"),
  trocarSenha: boolean("trocar_senha").notNull().default(true),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Quem executa a providência. Pode ser um usuário do app (os sócios, a Gabriela,
 * a Neiva) ou alguém de fora dele (TI terceirizada, fornecedor do site, suporte
 * do iManage), caso em que o contato fica registrado em texto livre.
 */
export const responsaveis = pgTable("responsaveis", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: tipoResponsavel("tipo").notNull().default("EXTERNO"),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, {
    onDelete: "set null",
  }),
  contato: text("contato"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Catálogo de providências. Cada processo novo copia daqui as tarefas ativas do
 * seu tipo, de modo que alterar o catálogo não mexe em processos já abertos.
 */
export const modelosTarefa = pgTable(
  "modelos_tarefa",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tipo: tipoProcesso("tipo").notNull(),
    ordem: integer("ordem").notNull().default(0),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    sistema: text("sistema"),
    responsavelId: uuid("responsavel_id").references(() => responsaveis.id, {
      onDelete: "set null",
    }),
    comoPedir: text("como_pedir"),
    prazoDias: integer("prazo_dias"),
    obrigatoria: boolean("obrigatoria").notNull().default(true),
    ativa: boolean("ativa").notNull().default(true),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    atualizadoEm: timestamp("atualizado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("modelos_tarefa_tipo_idx").on(t.tipo, t.ordem)],
);

export const processos = pgTable(
  "processos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tipo: tipoProcesso("tipo").notNull(),
    pessoaNome: text("pessoa_nome").notNull(),
    pessoaCargo: text("pessoa_cargo"),
    pessoaEmail: text("pessoa_email"),
    dataReferencia: date("data_referencia"),
    status: statusProcesso("status").notNull().default("EM_ANDAMENTO"),
    observacoes: text("observacoes"),
    criadoPorId: uuid("criado_por_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    concluidoEm: timestamp("concluido_em", { withTimezone: true }),
  },
  (t) => [index("processos_status_idx").on(t.status, t.criadoEm)],
);

export const tarefas = pgTable(
  "tarefas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    processoId: uuid("processo_id")
      .notNull()
      .references(() => processos.id, { onDelete: "cascade" }),
    modeloId: uuid("modelo_id").references(() => modelosTarefa.id, {
      onDelete: "set null",
    }),
    ordem: integer("ordem").notNull().default(0),
    titulo: text("titulo").notNull(),
    descricao: text("descricao"),
    sistema: text("sistema"),
    responsavelId: uuid("responsavel_id").references(() => responsaveis.id, {
      onDelete: "set null",
    }),
    comoPedir: text("como_pedir"),
    obrigatoria: boolean("obrigatoria").notNull().default(true),
    status: statusTarefa("status").notNull().default("PENDENTE"),
    prazo: date("prazo"),
    observacoes: text("observacoes"),
    solicitadaEm: timestamp("solicitada_em", { withTimezone: true }),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
    concluidaPorId: uuid("concluida_por_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
  },
  (t) => [index("tarefas_processo_idx").on(t.processoId, t.ordem)],
);

export const eventos = pgTable(
  "eventos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    processoId: uuid("processo_id")
      .notNull()
      .references(() => processos.id, { onDelete: "cascade" }),
    tarefaId: uuid("tarefa_id").references(() => tarefas.id, {
      onDelete: "cascade",
    }),
    usuarioId: uuid("usuario_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    acao: text("acao").notNull(),
    detalhe: text("detalhe"),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("eventos_processo_idx").on(t.processoId, t.criadoEm)],
);

export type Usuario = typeof usuarios.$inferSelect;
export type Responsavel = typeof responsaveis.$inferSelect;
export type ModeloTarefa = typeof modelosTarefa.$inferSelect;
export type Processo = typeof processos.$inferSelect;
export type Tarefa = typeof tarefas.$inferSelect;
export type Evento = typeof eventos.$inferSelect;
