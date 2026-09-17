import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { modelosTarefa, responsaveis, usuarios } from "./schema";
import {
  responsaveisIniciais,
  tarefasIniciais,
  usuariosIniciais,
} from "./seed-data";

/**
 * Popula o banco com as pessoas do escritório, os responsáveis e o catálogo
 * provisório de providências. Pode ser rodado mais de uma vez: registros já
 * existentes são preservados.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const senhaInicial = process.env.SENHA_INICIAL ?? randomBytes(9).toString("base64url");
  const senhaHash = await bcrypt.hash(senhaInicial, 10);

  const idsPorEmail = new Map<string, string>();
  for (const semente of usuariosIniciais) {
    const [existente] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.email, semente.email))
      .limit(1);

    if (existente) {
      idsPorEmail.set(semente.email, existente.id);
      continue;
    }

    const [criado] = await db
      .insert(usuarios)
      .values({ ...semente, senhaHash, trocarSenha: true })
      .returning({ id: usuarios.id });
    idsPorEmail.set(semente.email, criado.id);
    console.log(`Usuário criado: ${semente.email}`);
  }

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
        usuarioId: semente.emailUsuario
          ? (idsPorEmail.get(semente.emailUsuario) ?? null)
          : null,
        contato: semente.contato ?? null,
        observacoes: semente.observacoes ?? null,
      })
      .returning({ id: responsaveis.id });
    idsPorChave.set(semente.chave, criado.id);
    console.log(`Responsável criado: ${semente.nome}`);
  }

  const catalogoExistente = await db
    .select({ id: modelosTarefa.id })
    .from(modelosTarefa)
    .limit(1);

  if (catalogoExistente.length > 0) {
    console.log("Catálogo já tem providências cadastradas; nada foi inserido.");
  } else {
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

  await client.end();

  if (!process.env.SENHA_INICIAL) {
    console.log(`\nSenha inicial de todos os usuários novos: ${senhaInicial}`);
    console.log("Anote agora: ela não é exibida de novo.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
