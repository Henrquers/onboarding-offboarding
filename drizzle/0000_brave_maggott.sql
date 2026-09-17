CREATE TYPE "public"."papel_usuario" AS ENUM('ADMIN', 'SOCIO', 'ASSISTENTE');--> statement-breakpoint
CREATE TYPE "public"."status_processo" AS ENUM('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."status_tarefa" AS ENUM('PENDENTE', 'SOLICITADA', 'CONCLUIDA', 'NAO_APLICAVEL', 'BLOQUEADA');--> statement-breakpoint
CREATE TYPE "public"."tipo_processo" AS ENUM('ONBOARDING', 'OFFBOARDING');--> statement-breakpoint
CREATE TYPE "public"."tipo_responsavel" AS ENUM('USUARIO', 'EXTERNO');--> statement-breakpoint
CREATE TABLE "eventos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"tarefa_id" uuid,
	"usuario_id" uuid,
	"acao" text NOT NULL,
	"detalhe" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modelos_tarefa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_processo" NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"sistema" text,
	"responsavel_id" uuid,
	"como_pedir" text,
	"prazo_dias" integer,
	"obrigatoria" boolean DEFAULT true NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "processos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_processo" NOT NULL,
	"pessoa_nome" text NOT NULL,
	"pessoa_cargo" text,
	"pessoa_email" text,
	"data_referencia" date,
	"status" "status_processo" DEFAULT 'EM_ANDAMENTO' NOT NULL,
	"observacoes" text,
	"criado_por_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluido_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "responsaveis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_responsavel" DEFAULT 'EXTERNO' NOT NULL,
	"usuario_id" uuid,
	"contato" text,
	"observacoes" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarefas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"processo_id" uuid NOT NULL,
	"modelo_id" uuid,
	"ordem" integer DEFAULT 0 NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"sistema" text,
	"responsavel_id" uuid,
	"como_pedir" text,
	"obrigatoria" boolean DEFAULT true NOT NULL,
	"status" "status_tarefa" DEFAULT 'PENDENTE' NOT NULL,
	"prazo" date,
	"observacoes" text,
	"solicitada_em" timestamp with time zone,
	"concluida_em" timestamp with time zone,
	"concluida_por_id" uuid
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"papel" "papel_usuario" DEFAULT 'ASSISTENTE' NOT NULL,
	"trocar_senha" boolean DEFAULT true NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_tarefa_id_tarefas_id_fk" FOREIGN KEY ("tarefa_id") REFERENCES "public"."tarefas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modelos_tarefa" ADD CONSTRAINT "modelos_tarefa_responsavel_id_responsaveis_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."responsaveis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processos" ADD CONSTRAINT "processos_criado_por_id_usuarios_id_fk" FOREIGN KEY ("criado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_processo_id_processos_id_fk" FOREIGN KEY ("processo_id") REFERENCES "public"."processos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_modelo_id_modelos_tarefa_id_fk" FOREIGN KEY ("modelo_id") REFERENCES "public"."modelos_tarefa"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_responsavel_id_responsaveis_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."responsaveis"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_concluida_por_id_usuarios_id_fk" FOREIGN KEY ("concluida_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eventos_processo_idx" ON "eventos" USING btree ("processo_id","criado_em");--> statement-breakpoint
CREATE INDEX "modelos_tarefa_tipo_idx" ON "modelos_tarefa" USING btree ("tipo","ordem");--> statement-breakpoint
CREATE INDEX "processos_status_idx" ON "processos" USING btree ("status","criado_em");--> statement-breakpoint
CREATE INDEX "tarefas_processo_idx" ON "tarefas" USING btree ("processo_id","ordem");