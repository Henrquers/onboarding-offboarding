import Link from "next/link";
import { listarModelos } from "@/lib/consultas";
import { criarProcesso } from "../actions";

export const dynamic = "force-dynamic";

export default async function NovoProcesso() {
  const modelos = await listarModelos();
  const ativos = modelos.filter((m) => m.modelo.ativa);
  const totalOnboarding = ativos.filter((m) => m.modelo.tipo === "ONBOARDING").length;
  const totalOffboarding = ativos.filter((m) => m.modelo.tipo === "OFFBOARDING").length;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-lg font-semibold">Iniciar processo</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--texto-suave)" }}>
        Ao salvar, o app copia as providências ativas do catálogo e monta a lista
        de tarefas deste processo. Alterações posteriores no{" "}
        <Link href="/catalogo" className="underline">
          catálogo
        </Link>{" "}
        não mexem em processos já abertos.
      </p>

      <form action={criarProcesso} className="superficie space-y-5 rounded-lg p-6">
        <fieldset>
          <legend className="rotulo">Tipo de processo</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="superficie flex cursor-pointer items-start gap-3 rounded-lg p-3">
              <input type="radio" name="tipo" value="ONBOARDING" defaultChecked className="mt-1" />
              <span>
                <span className="block text-sm font-medium">Onboarding</span>
                <span className="block text-xs" style={{ color: "var(--texto-suave)" }}>
                  Entrada de colaborador · {totalOnboarding} providências
                </span>
              </span>
            </label>
            <label className="superficie flex cursor-pointer items-start gap-3 rounded-lg p-3">
              <input type="radio" name="tipo" value="OFFBOARDING" className="mt-1" />
              <span>
                <span className="block text-sm font-medium">Offboarding</span>
                <span className="block text-xs" style={{ color: "var(--texto-suave)" }}>
                  Saída de colaborador · {totalOffboarding} providências
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div>
          <label className="rotulo" htmlFor="pessoaNome">
            Nome da pessoa
          </label>
          <input className="campo" id="pessoaNome" name="pessoaNome" required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="rotulo" htmlFor="pessoaCargo">
              Cargo
            </label>
            <input className="campo" id="pessoaCargo" name="pessoaCargo" />
          </div>
          <div>
            <label className="rotulo" htmlFor="pessoaEmail">
              E-mail (se já houver)
            </label>
            <input className="campo" id="pessoaEmail" name="pessoaEmail" type="email" />
          </div>
        </div>

        <div>
          <label className="rotulo" htmlFor="dataReferencia">
            Data de entrada ou de saída
          </label>
          <input className="campo" id="dataReferencia" name="dataReferencia" type="date" />
          <p className="mt-1 text-xs" style={{ color: "var(--texto-suave)" }}>
            É a partir dela que o app calcula o prazo de cada providência.
          </p>
        </div>

        <div>
          <label className="rotulo" htmlFor="observacoes">
            Observações
          </label>
          <textarea className="campo" id="observacoes" name="observacoes" rows={3} />
        </div>

        <div className="flex gap-3">
          <button className="botao botao-primario">Criar processo</button>
          <Link href="/" className="botao">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
