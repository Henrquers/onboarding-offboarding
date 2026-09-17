"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { eventos, modelosTarefa, processos, tarefas } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth";
import { rotuloStatusTarefa } from "@/lib/rotulos";

const tipoProcessoEnum = z.enum(["ONBOARDING", "OFFBOARDING"]);
const statusTarefaEnum = z.enum([
  "PENDENTE",
  "SOLICITADA",
  "CONCLUIDA",
  "NAO_APLICAVEL",
  "BLOQUEADA",
]);

function textoOuNulo(valor: FormDataEntryValue | null) {
  const texto = typeof valor === "string" ? valor.trim() : "";
  return texto.length > 0 ? texto : null;
}

/** Soma dias corridos a uma data ISO (AAAA-MM-DD) sem escorregar de fuso. */
function somarDias(dataIso: string, dias: number) {
  const data = new Date(`${dataIso}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

const esquemaProcesso = z.object({
  tipo: tipoProcessoEnum,
  pessoaNome: z.string().trim().min(2, "Informe o nome da pessoa."),
  pessoaCargo: z.string().trim().optional(),
  pessoaEmail: z.string().trim().optional(),
  dataReferencia: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")
    .optional()
    .or(z.literal("")),
  observacoes: z.string().trim().optional(),
});

export async function criarProcesso(formData: FormData) {
  const usuario = await exigirUsuario();

  const dados = esquemaProcesso.parse({
    tipo: formData.get("tipo"),
    pessoaNome: formData.get("pessoaNome"),
    pessoaCargo: formData.get("pessoaCargo") ?? undefined,
    pessoaEmail: formData.get("pessoaEmail") ?? undefined,
    dataReferencia: formData.get("dataReferencia") ?? undefined,
    observacoes: formData.get("observacoes") ?? undefined,
  });

  const dataReferencia = dados.dataReferencia || null;

  const modelos = await db
    .select()
    .from(modelosTarefa)
    .where(
      and(eq(modelosTarefa.tipo, dados.tipo), eq(modelosTarefa.ativa, true)),
    )
    .orderBy(asc(modelosTarefa.ordem));

  const processoId = await db.transaction(async (tx) => {
    const [processo] = await tx
      .insert(processos)
      .values({
        tipo: dados.tipo,
        pessoaNome: dados.pessoaNome,
        pessoaCargo: textoOuNulo(dados.pessoaCargo ?? null),
        pessoaEmail: textoOuNulo(dados.pessoaEmail ?? null),
        dataReferencia,
        observacoes: textoOuNulo(dados.observacoes ?? null),
        criadoPorId: usuario.id,
      })
      .returning({ id: processos.id });

    if (modelos.length > 0) {
      await tx.insert(tarefas).values(
        modelos.map((modelo, indice) => ({
          processoId: processo.id,
          modeloId: modelo.id,
          ordem: modelo.ordem || (indice + 1) * 10,
          titulo: modelo.titulo,
          descricao: modelo.descricao,
          sistema: modelo.sistema,
          responsavelId: modelo.responsavelId,
          comoPedir: modelo.comoPedir,
          obrigatoria: modelo.obrigatoria,
          prazo:
            dataReferencia && modelo.prazoDias !== null
              ? somarDias(dataReferencia, modelo.prazoDias)
              : null,
        })),
      );
    }

    await tx.insert(eventos).values({
      processoId: processo.id,
      usuarioId: usuario.id,
      acao: "Processo aberto",
      detalhe: `${modelos.length} providência(s) copiadas do catálogo.`,
    });

    return processo.id;
  });

  redirect(`/processos/${processoId}`);
}

export async function mudarStatusTarefa(formData: FormData) {
  const usuario = await exigirUsuario();
  const tarefaId = z.string().uuid().parse(formData.get("tarefaId"));
  const status = statusTarefaEnum.parse(formData.get("status"));

  const [tarefa] = await db
    .select()
    .from(tarefas)
    .where(eq(tarefas.id, tarefaId))
    .limit(1);
  if (!tarefa) return;

  const agora = new Date();
  await db.transaction(async (tx) => {
    await tx
      .update(tarefas)
      .set({
        status,
        solicitadaEm:
          status === "SOLICITADA" ? (tarefa.solicitadaEm ?? agora) : tarefa.solicitadaEm,
        concluidaEm: status === "CONCLUIDA" ? agora : null,
        concluidaPorId: status === "CONCLUIDA" ? usuario.id : null,
      })
      .where(eq(tarefas.id, tarefaId));

    await tx.insert(eventos).values({
      processoId: tarefa.processoId,
      tarefaId,
      usuarioId: usuario.id,
      acao: `Providência marcada como ${rotuloStatusTarefa[status].toLowerCase()}`,
      detalhe: tarefa.titulo,
    });
  });

  revalidatePath(`/processos/${tarefa.processoId}`);
  revalidatePath("/");
}

export async function salvarObservacaoTarefa(formData: FormData) {
  const usuario = await exigirUsuario();
  const tarefaId = z.string().uuid().parse(formData.get("tarefaId"));
  const observacoes = textoOuNulo(formData.get("observacoes"));

  const [tarefa] = await db
    .select({ processoId: tarefas.processoId, titulo: tarefas.titulo })
    .from(tarefas)
    .where(eq(tarefas.id, tarefaId))
    .limit(1);
  if (!tarefa) return;

  await db.transaction(async (tx) => {
    await tx.update(tarefas).set({ observacoes }).where(eq(tarefas.id, tarefaId));
    await tx.insert(eventos).values({
      processoId: tarefa.processoId,
      tarefaId,
      usuarioId: usuario.id,
      acao: "Observação da providência atualizada",
      detalhe: tarefa.titulo,
    });
  });

  revalidatePath(`/processos/${tarefa.processoId}`);
}

export async function adicionarTarefa(formData: FormData) {
  const usuario = await exigirUsuario();
  const processoId = z.string().uuid().parse(formData.get("processoId"));
  const titulo = z.string().trim().min(2).parse(formData.get("titulo"));
  const responsavelTexto = textoOuNulo(formData.get("responsavelId"));
  const responsavelId = responsavelTexto
    ? z.string().uuid().parse(responsavelTexto)
    : null;

  const [ultima] = await db
    .select({ ordem: tarefas.ordem })
    .from(tarefas)
    .where(eq(tarefas.processoId, processoId))
    .orderBy(desc(tarefas.ordem))
    .limit(1);

  await db.transaction(async (tx) => {
    await tx.insert(tarefas).values({
      processoId,
      titulo,
      descricao: textoOuNulo(formData.get("descricao")),
      sistema: textoOuNulo(formData.get("sistema")),
      responsavelId,
      ordem: (ultima?.ordem ?? 0) + 10,
    });

    await tx.insert(eventos).values({
      processoId,
      usuarioId: usuario.id,
      acao: "Providência avulsa incluída",
      detalhe: titulo,
    });
  });

  revalidatePath(`/processos/${processoId}`);
}

export async function mudarStatusProcesso(formData: FormData) {
  const usuario = await exigirUsuario();
  const processoId = z.string().uuid().parse(formData.get("processoId"));
  const status = z
    .enum(["EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"])
    .parse(formData.get("status"));

  await db.transaction(async (tx) => {
    await tx
      .update(processos)
      .set({
        status,
        concluidoEm: status === "CONCLUIDO" ? new Date() : null,
      })
      .where(eq(processos.id, processoId));

    await tx.insert(eventos).values({
      processoId,
      usuarioId: usuario.id,
      acao:
        status === "CONCLUIDO"
          ? "Processo concluído"
          : status === "CANCELADO"
            ? "Processo cancelado"
            : "Processo reaberto",
    });
  });

  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/");
}
