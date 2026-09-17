import { FormularioModelo } from "@/components/formulario-modelo";
import { listarModelos, listarResponsaveis } from "@/lib/consultas";
import { rotuloTipoProcesso } from "@/lib/rotulos";
import { atualizarModelo, criarModelo, excluirModelo } from "./actions";

export const dynamic = "force-dynamic";

export default async function PaginaCatalogo() {
  const [linhas, responsaveis] = await Promise.all([
    listarModelos(),
    listarResponsaveis(false),
  ]);

  const grupos = (["ONBOARDING", "OFFBOARDING"] as const).map((tipo) => ({
    tipo,
    itens: linhas.filter((l) => l.modelo.tipo === tipo),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Catálogo de providências</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--texto-suave)" }}>
          É daqui que sai a lista de tarefas de cada processo novo. O conteúdo
          atual é provisório, montado a partir das providências citadas na
          abertura do projeto; substitua pelas listas oficiais conforme elas
          chegarem. Editar aqui não altera processos já abertos.
        </p>
      </div>

      {grupos.map((grupo) => (
        <section key={grupo.tipo}>
          <h2 className="mb-3 text-base font-semibold">
            {rotuloTipoProcesso[grupo.tipo]}
            <span className="ms-2 text-sm font-normal" style={{ color: "var(--texto-suave)" }}>
              {grupo.itens.filter((i) => i.modelo.ativa).length} ativas de {grupo.itens.length}
            </span>
          </h2>

          <ul className="superficie divide-y rounded-lg" style={{ borderColor: "var(--borda)" }}>
            {grupo.itens.map(({ modelo, responsavelNome }) => (
              <li key={modelo.id} className="px-4 py-3">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-sm marker:content-['']">
                    <span className="w-8 shrink-0 tabular-nums" style={{ color: "var(--texto-suave)" }}>
                      {modelo.ordem}
                    </span>
                    <span className={modelo.ativa ? "" : "line-through opacity-60"}>
                      {modelo.titulo}
                    </span>
                    {modelo.sistema ? (
                      <span className="text-xs" style={{ color: "var(--texto-suave)" }}>
                        {modelo.sistema}
                      </span>
                    ) : null}
                    <span className="ms-auto text-xs" style={{ color: "var(--texto-suave)" }}>
                      {responsavelNome ?? "sem responsável"}
                      {modelo.prazoDias !== null ? ` · D+${modelo.prazoDias}` : ""}
                    </span>
                  </summary>

                  <div className="mt-4">
                    <FormularioModelo
                      acao={atualizarModelo}
                      responsaveis={responsaveis}
                      modelo={modelo}
                      textoBotao="Salvar"
                    >
                      <button
                        className="botao px-3 py-1.5 text-xs"
                        formAction={excluirModelo}
                        formNoValidate
                      >
                        Excluir do catálogo
                      </button>
                    </FormularioModelo>
                  </div>
                </details>
              </li>
            ))}
            {grupo.itens.length === 0 ? (
              <li className="px-4 py-3 text-sm" style={{ color: "var(--texto-suave)" }}>
                Nenhuma providência cadastrada.
              </li>
            ) : null}
          </ul>
        </section>
      ))}

      <section>
        <h2 className="mb-3 text-base font-semibold">Incluir providência no catálogo</h2>
        <div className="superficie rounded-lg p-5">
          <FormularioModelo
            acao={criarModelo}
            responsaveis={responsaveis}
            textoBotao="Incluir no catálogo"
          />
        </div>
      </section>
    </div>
  );
}
