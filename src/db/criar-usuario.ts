import "dotenv/config";
import { parseArgs } from "node:util";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { gravarUsuario, type Papel } from "./popular";

const PAPEIS: Papel[] = ["ADMIN", "SOCIO", "ASSISTENTE"];

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

  if (!values.nome || !values.email || !values.senha) {
    throw new Error(
      'Uso: npm run db:usuario -- --nome "Nome" --email "email@dominio" --papel ADMIN --senha "senha"',
    );
  }
  if (!PAPEIS.includes(values.papel as Papel)) {
    throw new Error(`Papel inválido. Use um destes: ${PAPEIS.join(", ")}.`);
  }
  if (values.senha.length < 8) {
    throw new Error("A senha precisa ter ao menos 8 caracteres.");
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  const resultado = await gravarUsuario(db, {
    nome: values.nome,
    email: values.email,
    senha: values.senha,
    papel: values.papel as Papel,
  });

  await client.end();
  console.log(
    `Acesso ${resultado}: ${values.email.trim().toLowerCase()}\n` +
      "A pessoa troca a senha no primeiro acesso, na tela Conta.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
