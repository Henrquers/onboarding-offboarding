import { asc } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth";
import { rotuloPapel } from "@/lib/rotulos";
import { alternarUsuario, criarUsuario, redefinirSenha } from "./actions";
import { FormularioSenha } from "./formulario-senha";

export const dynamic = "force-dynamic";

export default async function PaginaConta({
  searchParams,
}: {
  searchParams: Promise<{ trocar?: string }>;
}) {
  const usuario = await exigirUsuario();
  const { trocar } = await searchParams;
  const ehAdmin = usuario.papel === "ADMIN";
  const pessoas = ehAdmin
    ? await db.select().from(usuarios).orderBy(asc(usuarios.nome))
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">{usuario.nome}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--texto-suave)" }}>
          {usuario.email} · {rotuloPapel[usuario.papel]}
        </p>
      </div>

      {trocar || usuario.trocarSenha ? (
        <p className="superficie rounded-lg p-4 text-sm">
          Você ainda está com a senha inicial. Defina uma senha sua abaixo.
        </p>
      ) : null}

      <section className="superficie rounded-lg p-5">
        <h2 className="mb-4 text-base font-semibold">Alterar senha</h2>
        <FormularioSenha />
      </section>

      {ehAdmin ? (
        <>
          <section>
            <h2 className="mb-3 text-base font-semibold">Pessoas com acesso</h2>
            <ul className="superficie divide-y rounded-lg" style={{ borderColor: "var(--borda)" }}>
              {pessoas.map((pessoa) => (
                <li key={pessoa.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className={pessoa.ativo ? "" : "line-through opacity-60"}>
                    {pessoa.nome}
                  </span>
                  <span className="text-xs" style={{ color: "var(--texto-suave)" }}>
                    {pessoa.email} · {rotuloPapel[pessoa.papel]}
                  </span>

                  <div className="ms-auto flex flex-wrap items-center gap-2">
                    <form action={redefinirSenha} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={pessoa.id} />
                      <input
                        className="campo w-40 py-1 text-xs"
                        name="senha"
                        type="password"
                        minLength={8}
                        placeholder="nova senha"
                        required
                      />
                      <button className="botao px-2 py-1 text-xs">Redefinir</button>
                    </form>

                    {pessoa.id === usuario.id ? null : (
                      <form action={alternarUsuario}>
                        <input type="hidden" name="id" value={pessoa.id} />
                        <button className="botao px-2 py-1 text-xs">
                          {pessoa.ativo ? "Desativar" : "Reativar"}
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">Incluir pessoa</h2>
            <form action={criarUsuario} className="superficie space-y-4 rounded-lg p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="rotulo" htmlFor="nome">
                    Nome
                  </label>
                  <input className="campo" id="nome" name="nome" required />
                </div>
                <div>
                  <label className="rotulo" htmlFor="email">
                    E-mail
                  </label>
                  <input className="campo" id="email" name="email" type="email" required />
                </div>
                <div>
                  <label className="rotulo" htmlFor="papel">
                    Papel
                  </label>
                  <select className="campo" id="papel" name="papel" defaultValue="ASSISTENTE">
                    <option value="ASSISTENTE">Assistente</option>
                    <option value="SOCIO">Sócio</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="rotulo" htmlFor="senha">
                    Senha inicial
                  </label>
                  <input
                    className="campo"
                    id="senha"
                    name="senha"
                    type="password"
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <button className="botao botao-primario px-3 py-1.5 text-xs">Incluir</button>
            </form>
          </section>
        </>
      ) : null}
    </div>
  );
}
