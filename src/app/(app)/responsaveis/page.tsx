import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios, type Responsavel, type Usuario } from "@/db/schema";
import { listarResponsaveis } from "@/lib/consultas";
import { atualizarResponsavel, criarResponsavel } from "./actions";

export const dynamic = "force-dynamic";

function Formulario({
  acao,
  pessoas,
  responsavel,
  textoBotao,
}: {
  acao: (formData: FormData) => Promise<void>;
  pessoas: Usuario[];
  responsavel?: Responsavel;
  textoBotao: string;
}) {
  const id = responsavel?.id ?? "novo";

  return (
    <form action={acao} className="space-y-4">
      {responsavel ? <input type="hidden" name="id" value={responsavel.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="rotulo" htmlFor={`nome-${id}`}>
            Nome
          </label>
          <input
            className="campo"
            id={`nome-${id}`}
            name="nome"
            defaultValue={responsavel?.nome ?? ""}
            required
          />
        </div>

        <div>
          <label className="rotulo" htmlFor={`tipo-${id}`}>
            Tipo
          </label>
          <select
            className="campo"
            id={`tipo-${id}`}
            name="tipo"
            defaultValue={responsavel?.tipo ?? "EXTERNO"}
          >
            <option value="EXTERNO">Fora do app (TI, fornecedor, suporte)</option>
            <option value="USUARIO">Pessoa que usa o app</option>
          </select>
        </div>

        <div>
          <label className="rotulo" htmlFor={`usuario-${id}`}>
            Vincular a um usuário
          </label>
          <select
            className="campo"
            id={`usuario-${id}`}
            name="usuarioId"
            defaultValue={responsavel?.usuarioId ?? ""}
          >
            <option value="">Nenhum</option>
            {pessoas.map((pessoa) => (
              <option key={pessoa.id} value={pessoa.id}>
                {pessoa.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="rotulo" htmlFor={`contato-${id}`}>
            Contato
          </label>
          <input
            className="campo"
            id={`contato-${id}`}
            name="contato"
            defaultValue={responsavel?.contato ?? ""}
            placeholder="E-mail, telefone ou canal de chamados"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="rotulo" htmlFor={`obs-${id}`}>
            Observações
          </label>
          <textarea
            className="campo"
            id={`obs-${id}`}
            name="observacoes"
            rows={2}
            defaultValue={responsavel?.observacoes ?? ""}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ativo" defaultChecked={responsavel?.ativo ?? true} />
          Ativo
        </label>
      </div>

      <button className="botao botao-primario px-3 py-1.5 text-xs">{textoBotao}</button>
    </form>
  );
}

export default async function PaginaResponsaveis() {
  const [lista, pessoas] = await Promise.all([
    listarResponsaveis(false),
    db.select().from(usuarios).where(eq(usuarios.ativo, true)).orderBy(asc(usuarios.nome)),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Responsáveis</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--texto-suave)" }}>
          Quem executa cada providência. Os contatos preenchidos aqui aparecem na
          tela do processo, junto da tarefa correspondente.
        </p>
      </div>

      <ul className="superficie divide-y rounded-lg" style={{ borderColor: "var(--borda)" }}>
        {lista.map((responsavel) => (
          <li key={responsavel.id} className="px-4 py-3">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-sm marker:content-['']">
                <span className={responsavel.ativo ? "" : "line-through opacity-60"}>
                  {responsavel.nome}
                </span>
                <span className="ms-auto text-xs" style={{ color: "var(--texto-suave)" }}>
                  {responsavel.contato ?? "sem contato cadastrado"}
                </span>
              </summary>
              <div className="mt-4">
                <Formulario
                  acao={atualizarResponsavel}
                  pessoas={pessoas}
                  responsavel={responsavel}
                  textoBotao="Salvar"
                />
              </div>
            </details>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="mb-3 text-base font-semibold">Incluir responsável</h2>
        <div className="superficie rounded-lg p-5">
          <Formulario acao={criarResponsavel} pessoas={pessoas} textoBotao="Incluir" />
        </div>
      </section>
    </div>
  );
}
