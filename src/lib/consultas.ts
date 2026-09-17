import "server-only";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  eventos,
  modelosTarefa,
  processos,
  responsaveis,
  tarefas,
  usuarios,
} from "@/db/schema";

export type ResumoProcesso = Awaited<
  ReturnType<typeof listarProcessos>
>[number];

/** Processos com a contagem de tarefas resolvidas, para as listas e o painel. */
export async function listarProcessos(status?: "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO") {
  const resolvidas = sql<number>`count(*) filter (where ${tarefas.status} in ('CONCLUIDA', 'NAO_APLICAVEL'))`;
  const pendentes = sql<number>`count(*) filter (where ${tarefas.status} not in ('CONCLUIDA', 'NAO_APLICAVEL'))`;

  return db
    .select({
      id: processos.id,
      tipo: processos.tipo,
      pessoaNome: processos.pessoaNome,
      pessoaCargo: processos.pessoaCargo,
      dataReferencia: processos.dataReferencia,
      status: processos.status,
      criadoEm: processos.criadoEm,
      total: count(tarefas.id),
      resolvidas,
      pendentes,
    })
    .from(processos)
    .leftJoin(tarefas, eq(tarefas.processoId, processos.id))
    .where(status ? eq(processos.status, status) : undefined)
    .groupBy(processos.id)
    .orderBy(desc(processos.criadoEm));
}

export async function obterProcesso(id: string) {
  const [processo] = await db
    .select({
      processo: processos,
      criadoPor: usuarios.nome,
    })
    .from(processos)
    .leftJoin(usuarios, eq(usuarios.id, processos.criadoPorId))
    .where(eq(processos.id, id))
    .limit(1);

  return processo ?? null;
}

export async function listarTarefasDoProcesso(processoId: string) {
  return db
    .select({
      tarefa: tarefas,
      responsavelNome: responsaveis.nome,
      responsavelContato: responsaveis.contato,
      concluidaPor: usuarios.nome,
    })
    .from(tarefas)
    .leftJoin(responsaveis, eq(responsaveis.id, tarefas.responsavelId))
    .leftJoin(usuarios, eq(usuarios.id, tarefas.concluidaPorId))
    .where(eq(tarefas.processoId, processoId))
    .orderBy(asc(tarefas.ordem), asc(tarefas.titulo));
}

export async function listarEventos(processoId: string, limite = 50) {
  return db
    .select({
      evento: eventos,
      usuarioNome: usuarios.nome,
    })
    .from(eventos)
    .leftJoin(usuarios, eq(usuarios.id, eventos.usuarioId))
    .where(eq(eventos.processoId, processoId))
    .orderBy(desc(eventos.criadoEm))
    .limit(limite);
}

export async function listarResponsaveis(apenasAtivos = true) {
  return db
    .select()
    .from(responsaveis)
    .where(apenasAtivos ? eq(responsaveis.ativo, true) : undefined)
    .orderBy(asc(responsaveis.nome));
}

export async function listarModelos(tipo?: "ONBOARDING" | "OFFBOARDING") {
  return db
    .select({
      modelo: modelosTarefa,
      responsavelNome: responsaveis.nome,
    })
    .from(modelosTarefa)
    .leftJoin(responsaveis, eq(responsaveis.id, modelosTarefa.responsavelId))
    .where(tipo ? eq(modelosTarefa.tipo, tipo) : undefined)
    .orderBy(asc(modelosTarefa.tipo), asc(modelosTarefa.ordem));
}

/** Tarefas em aberto de todos os processos ativos, agrupáveis por responsável. */
export async function listarPendencias() {
  return db
    .select({
      tarefaId: tarefas.id,
      titulo: tarefas.titulo,
      status: tarefas.status,
      prazo: tarefas.prazo,
      sistema: tarefas.sistema,
      responsavelNome: responsaveis.nome,
      processoId: processos.id,
      processoTipo: processos.tipo,
      pessoaNome: processos.pessoaNome,
    })
    .from(tarefas)
    .innerJoin(processos, eq(processos.id, tarefas.processoId))
    .leftJoin(responsaveis, eq(responsaveis.id, tarefas.responsavelId))
    .where(
      and(
        eq(processos.status, "EM_ANDAMENTO"),
        inArray(tarefas.status, ["PENDENTE", "SOLICITADA", "BLOQUEADA"]),
      ),
    )
    .orderBy(asc(tarefas.prazo), asc(processos.criadoEm));
}
