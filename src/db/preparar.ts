import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { existeAlgumUsuario, gravarUsuario, popular } from "./popular";

/**
 * Deixa o banco pronto sozinho: aplica as migrações, cria os responsáveis e o
 * catálogo e, se ainda não houver ninguém cadastrado, cria o primeiro acesso a
 * partir de ADMIN_EMAIL e ADMIN_SENHA.
 *
 * É o que roda antes do build na Vercel, para não ser preciso mexer em terminal
 * para publicar. O primeiro acesso só é criado quando a tabela de usuários está
 * vazia, de modo que um deploy novo nunca sobrescreve a senha de ninguém.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Configure-a nas variáveis de ambiente do projeto.",
    );
  }

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrações aplicadas.");

  await popular(db);

  const jaTemGente = await existeAlgumUsuario(db);
  const email = process.env.ADMIN_EMAIL?.trim();
  const senha = process.env.ADMIN_SENHA;

  if (jaTemGente) {
    console.log("Já existem acessos cadastrados; nenhum foi criado ou alterado.");
  } else if (email && senha && senha.length >= 8) {
    await gravarUsuario(db, {
      nome: process.env.ADMIN_NOME?.trim() || email,
      email,
      senha,
      papel: "ADMIN",
    });
    console.log(`Primeiro acesso criado: ${email.toLowerCase()}`);
  } else {
    console.log(
      "Nenhum acesso cadastrado. Defina ADMIN_EMAIL e ADMIN_SENHA (mínimo de 8 caracteres) e publique de novo.",
    );
  }

  await client.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
