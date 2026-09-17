import Link from "next/link";
import { notFound } from "next/navigation";
import { Etiqueta } from "@/components/etiqueta";
import { LinhaTarefa } from "@/components/linha-tarefa";
import { Progresso } from "@/components/progresso";
import {
  listarEventos,
  listarResponsaveis,
  listarTarefasDoProcesso,
  obterProcesso,
} from "@/lib/consultas";
import {
  classeStatusProcesso,
  formatarData,
  formatarDataHora,
  rotuloStatusProcesso,
  rotuloTipoProcesso,
} from "@/lib/rotulos";
import { adicionarTarefa, mudarStatusProcesso } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaginaProcesso({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const registro = await obterProcesso(id);
  if (!registro) notFound();

  const { processo, criadoPor } = registro;
  const [linhas, historico, responsaveis] = await Promise.all([
    listarTarefasDoProcesso(processo.id),
    listarEventos(processo.id),
    listarResponsaveis(),
  ]);

  const editavel = processo.status === "EM_ANDAMENTO";
  const resolvidas = linhas.filter(
    (l) => l.tarefa.status === "CONCLUIDA" || l.tarefa.status === "NAO_APLICAVEL",
  );
  const emAberto = linhas.filter(
    (l) => l.tarefa.status !== "CONCLUIDA" && l.tarefa.status !== "NAO_APLICAVEL",
  );

  return (
    <div className="space-y-8">
      <header className="superficie rounded-lg p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">{processo.pessoaNome}</h1>
          <Etiqueta classe={classeStatusProcesso[processo.status]}>
            {rotuloTipoProcesso[processo.tipo]} · {rotuloStatusProcesso[processo.status]}
          </Etiqueta>
        </div>

        <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="inline" style={{ color: "var(--texto-suave)" }}>
              Cargo:{" "}
            </dt>
            <dd className="inline">{processo.pessoaCargo ?? "–"}</dd>
          </div>
          <div>
            <dt className="inline" style={{ color: "var(--texto-suave)" }}>
              {processo.tipo === "ONBOARDING" ? "Entrada" : "Saída"}:{" "}
            </dt>
            <dd className="inline">{formatarData(processo.dataReferencia)}</dd>
          </div>
          <div>
            <dt className="inline" style={{ color: "var(--texto-suave)" }}>
              E-mail:{" "}
            </dt>
            <dd className="inline">{processo.pessoaEmail ?? "–"}</dd>
          </div>
          <div>
            <dt className="inline" style={{ color: "var(--texto-suave)" }}>
              Aberto por:{" "}
            </dt>
            <dd className="inline">
              {criadoPor ?? "–"} em {formatarData(processo.criadoEm)}
            </dd>
          </div>
        </dl>

        {processo.observacoes ? (
          <p className="mt-3 text-sm">{processo.observacoes}</p>
        ) : null}

        <div className="mt-4 max-w-sm">
          <Progresso resolvidas={resolvidas.length} total={linhas.length} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {editavel ? (
            <>
              <form action={mudarStatusProcesso}>
                <input type="hidden" name="processoId" value={processo.id} />
                <input type="hidden" name="status" value="CONCLUIDO" />
                <button
                  className="botao botao-primario px-3 py-1.5 text-xs"
                  disabled={emAberto.length > 0}
                  title={
                    emAberto.length > 0
                      ? "Ainda há providências em aberto."
                      : undefined
                  }
                >
                  Concluir processo
                </button>
              </form>
              <form action={mudarStatusProcesso}>
                <input type="hidden" name="processoId" value={processo.id} />
                <input type="hidden" name="status" value="CANCELADO" />
                <button className="botao px-3 py-1.5 text-xs">Cancelar processo</button>
              </form>
            </>
          ) : (
            <form action={mudarStatusProcesso}>
              <input type="hidden" name="processoId" value={processo.id} />
              <input type="hidden" name="status" value="EM_ANDAMENTO" />
              <button className="botao px-3 py-1.5 text-xs">Reabrir processo</button>
            </form>
          )}
          <Link href="/" className="botao px-3 py-1.5 text-xs">
            Voltar
          </Link>
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-base font-semibold">
          Em aberto
          <span className="ms-2 text-sm font-normal" style={{ color: "var(--texto-suave)" }}>
            {emAberto.length}
          </span>
        </h2>
        {emAberto.length === 0 ? (
          <p className="superficie rounded-lg p-5 text-sm" style={{ color: "var(--texto-suave)" }}>
            Todas as providências foram resolvidas.
          </p>
        ) : (
          <ul className="superficie divide-y rounded-lg" style={{ borderColor: "var(--borda)" }}>
            {emAberto.map((linha) => (
              <LinhaTarefa
                key={linha.tarefa.id}
                tarefa={linha.tarefa}
                responsavelNome={linha.responsavelNome}
                responsavelContato={linha.responsavelContato}
                concluidaPor={linha.concluidaPor}
                editavel={editavel}
              />
            ))}
          </ul>
        )}
      </section>

      {resolvidas.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-semibold">
            Resolvidas
            <span className="ms-2 text-sm font-normal" style={{ color: "var(--texto-suave)" }}>
              {resolvidas.length}
            </span>
          </h2>
          <ul className="superficie divide-y rounded-lg" style={{ borderColor: "var(--borda)" }}>
            {resolvidas.map((linha) => (
              <LinhaTarefa
                key={linha.tarefa.id}
                tarefa={linha.tarefa}
                responsavelNome={linha.responsavelNome}
                responsavelContato={linha.responsavelContato}
                concluidaPor={linha.concluidaPor}
                editavel={editavel}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {editavel ? (
        <section>
          <h2 className="mb-3 text-base font-semibold">Incluir providência avulsa</h2>
          <form action={adicionarTarefa} className="superficie space-y-4 rounded-lg p-5">
            <input type="hidden" name="processoId" value={processo.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="rotulo" htmlFor="titulo">
                  O que precisa ser feito
                </label>
                <input className="campo" id="titulo" name="titulo" required />
              </div>
              <div>
                <label className="rotulo" htmlFor="sistema">
                  Sistema
                </label>
                <input className="campo" id="sistema" name="sistema" />
              </div>
              <div>
                <label className="rotulo" htmlFor="responsavelId">
                  A quem pedir
                </label>
                <select className="campo" id="responsavelId" name="responsavelId" defaultValue="">
                  <option value="">Não definido</option>
                  {responsaveis.map((responsavel) => (
                    <option key={responsavel.id} value={responsavel.id}>
                      {responsavel.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="rotulo" htmlFor="descricao">
                  Detalhes
                </label>
                <textarea className="campo" id="descricao" name="descricao" rows={2} />
              </div>
            </div>
            <button className="botao">Incluir</button>
            <p className="text-xs" style={{ color: "var(--texto-suave)" }}>
              Vale só para este processo. Para valer em todos, cadastre no{" "}
              <Link href="/catalogo" className="underline">
                catálogo
              </Link>
              .
            </p>
          </form>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-base font-semibold">Histórico</h2>
        <ul className="superficie divide-y rounded-lg text-sm" style={{ borderColor: "var(--borda)" }}>
          {historico.map(({ evento, usuarioNome }) => (
            <li key={evento.id} className="flex flex-wrap gap-x-3 px-4 py-2">
              <span className="tabular-nums" style={{ color: "var(--texto-suave)" }}>
                {formatarDataHora(evento.criadoEm)}
              </span>
              <span>{evento.acao}</span>
              {evento.detalhe ? (
                <span style={{ color: "var(--texto-suave)" }}>{evento.detalhe}</span>
              ) : null}
              <span className="ms-auto text-xs" style={{ color: "var(--texto-suave)" }}>
                {usuarioNome ?? "–"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
