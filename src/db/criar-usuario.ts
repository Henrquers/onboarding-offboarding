import "dotenv/config";
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { usuarios } from "./schema";

/**
 * Cria (ou atualiza) o acesso de uma pessoa.
 *
 *   npm run db:usuario -- --nome "Fulana" --email "fulana@exemplo.com" \
 *     --papel ADMIN --senha "senha-provisoria"
 */
async function main() {
  const { values } = parseArgs({
    options: {
      nome: { type: "string" },
      email: { type: "string" },
      papel: { type: "string", default: "ASSISTENTE" },
      senha: { type: "string" },
    },
  });

  const papeis = ["ADMIN", "SOCIO", "ASSISTENTE"] as const;
  type Papel = (typeof papeis)[number];

  if (!values.nome || !values.email || !values.senha) {
    throw new Error(
      'Uso: npm run db:usuario -- --nome "Nome" --email "email@dominio" --papel ADMIN --senha "senha"',
    );
  }
  if (!papeis.includes(values.papel as Papel)) {
    throw new Error(`Papel inválido. Use um destes: ${papeis.join(", ")}.`);
  }
  if (values.senha.length < 8) {
    throw new Error("A senha precisa ter ao menos 8 caracteres.");
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const email = values.email.trim().toLowerCase();
  const senhaHash = await bcrypt.hash(values.senha, 10);

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, email))
    .limit(1);

  if (existente) {
    await db
      .update(usuarios)
      .set({
        nome: values.nome,
        papel: values.papel as Papel,
        senhaHash,
        trocarSenha: true,
        ativo: true,
      })
      .where(eq(usuarios.id, existente.id));
    console.log(`Acesso atualizado: ${email}`);
  } else {
    await db.insert(usuarios).values({
      nome: values.nome,
      email,
      papel: values.papel as Papel,
      senhaHash,
      trocarSenha: true,
    });
    console.log(`Acesso criado: ${email}`);
  }

  await client.end();
  console.log("A pessoa troca a senha no primeiro acesso, na tela Conta.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
