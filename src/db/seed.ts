import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { existeAlgumUsuario, popular } from "./popular";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida.");

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  await popular(db);

  if (!(await existeAlgumUsuario(db))) {
    console.log(
      "\nNenhum acesso cadastrado ainda. Crie o primeiro com:\n" +
        '  npm run db:usuario -- --nome "Fulana" --email "fulana@exemplo.com" --papel ADMIN --senha "senha-provisoria"',
    );
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
