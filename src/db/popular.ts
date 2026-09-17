import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { modelosTarefa, responsaveis, usuarios } from "./schema";
import { responsaveisIniciais, tarefasIniciais } from "./seed-data";

type Banco = PostgresJsDatabase<Record<string, never>>;

export type Papel = "ADMIN" | "SOCIO" | "ASSISTENTE";

/**
 * Cria os responsáveis e o catálogo de providências. Pode rodar quantas vezes
 * for preciso: responsável já cadastrado é preservado e o catálogo só é
 * escrito quando está vazio, para não desfazer edições feitas na interface.
 */
export async function popular(db: Banco) {
  const idsPorChave = new Map<string, string>();

  for (const semente of responsaveisIniciais) {
    const [existente] = await db
      .select({ id: responsaveis.id })
      .from(responsaveis)
      .where(eq(responsaveis.nome, semente.nome))
      .limit(1);

    if (existente) {
      idsPorChave.set(semente.chave, existente.id);
      continue;
    }

    const [criado] = await db
      .insert(responsaveis)
      .values({
        nome: semente.nome,
        tipo: semente.tipo,
        contato: semente.contato ?? null,
        observacoes: semente.observacoes ?? null,
      })
      .returning({ id: responsaveis.id });
    idsPorChave.set(semente.chave, criado.id);
    console.log(`Responsável criado: ${semente.nome}`);
  }

  const catalogo = await db
    .select({ id: modelosTarefa.id })
    .from(modelosTarefa)
    .limit(1);

  if (catalogo.length > 0) {
    console.log("Catálogo já tem providências cadastradas; nada foi inserido.");
    return;
  }

  let ordem = 0;
  let ultimoTipo = "";
  for (const tarefa of tarefasIniciais) {
    if (tarefa.tipo !== ultimoTipo) {
      ordem = 0;
      ultimoTipo = tarefa.tipo;
    }
    ordem += 10;
    await db.insert(modelosTarefa).values({
      tipo: tarefa.tipo,
      ordem,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao ?? null,
      sistema: tarefa.sistema ?? null,
      responsavelId: idsPorChave.get(tarefa.responsavel) ?? null,
      comoPedir: tarefa.comoPedir ?? null,
      prazoDias: tarefa.prazoDias ?? null,
      obrigatoria: tarefa.obrigatoria ?? true,
    });
  }
  console.log(`Catálogo criado com ${tarefasIniciais.length} providências.`);
}

/** Cria o acesso de uma pessoa ou atualiza o que já existe com esse e-mail. */
export async function gravarUsuario(
  db: Banco,
  dados: { nome: string; email: string; senha: string; papel: Papel },
) {
  const email = dados.email.trim().toLowerCase();
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1);

  if (existente) {
    await db
      .update(usuarios)
      .set({
        nome: dados.nome,
        papel: dados.papel,
        senhaHash,
        trocarSenha: true,
        ativo: true,
      })
      .where(eq(usuarios.id, existente.id));
    return "atualizado" as const;
  }

  await db.insert(usuarios).values({
    nome: dados.nome,
    email,
    papel: dados.papel,
    senhaHash,
    trocarSenha: true,
  });
  return "criado" as const;
}

export async function existeAlgumUsuario(db: Banco) {
  const linhas = await db.select({ id: usuarios.id }).from(usuarios).limit(1);
  return linhas.length > 0;
}
